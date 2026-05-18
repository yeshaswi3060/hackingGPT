"""INTERACTIVE FEEDBACK (CRITICAL):
If you reach a point where you cannot proceed without specific information from the human (e.g., a target IP, credentials, clarification on scope), you MUST use the `<ask_user>` tag.
- Format: `<ask_user>Your question here</ask_user>`
- Use this ONLY when you are genuinely stuck or need specific data to continue the attack.
- When you use this tag, the system will pause and wait for the human to reply.
- Do NOT provide a generic "Mission complete" message if you are waiting for a user response.

Stay focused on finding and extracting flags efficiently.
Be thorough in enumeration, creative in exploitation, and RELENTLESSLY persistent in flag hunting.
"""

import asyncio
import json
import re
from pathlib import Path
from enum import Enum
from typing import Any, ClassVar, Set

from testinggpt.core.backend import (
    AgentBackend,
    AgentMessage,
    LiteLLMBackend,
    MessageType,
)
from testinggpt.core.config import testinggptConfig
from testinggpt.core.events import Event, EventBus, EventType
from testinggpt.core.session import SessionStatus, SessionStore


class AgentState(Enum):
    """Simple 5-state model for agent lifecycle."""

    IDLE = "idle"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    ERROR = "error"


class AgentController:
    """
    Central orchestrator with lifecycle management.

    Features:
    - Framework-agnostic via AgentBackend
    - Pause/resume/stop control
    - Instruction injection
    - Session persistence
    """

    # Flag detection patterns
    FLAG_PATTERNS: ClassVar[list[str]] = [
        r"flag\{[^\}]+\}",  # flag{...}
        r"FLAG\{[^\}]+\}",  # FLAG{...}
        r"HTB\{[^\}]+\}",  # HTB{...}
        r"CTF\{[^\}]+\}",  # CTF{...}
        r"[A-Za-z0-9_]+\{[^\}]+\}",  # Generic CTF format
        r"\b[a-f0-9]{32}\b",  # 32-char hex (HTB user/root flags)
    ]

    def __init__(
        self,
        config: testinggptConfig,
        backend: AgentBackend | None = None,
        session_store: SessionStore | None = None,
        events: EventBus | None = None,
    ):
        """Initialize controller.

        Args:
            config: testinggpt configuration
            backend: Optional custom backend (defaults to ClaudeCodeBackend)
            session_store: Optional custom session store
            events: Optional custom event bus
        """
        self.config = config
        self.backend = backend
        self.sessions = session_store or SessionStore()
        self.events = events or EventBus.get()

        # State management
        self._state = AgentState.IDLE
        self._pause_requested = False
        self._stop_requested = False
        self._resume_event = asyncio.Event()
        self._waiting_for_input = False
        self._last_failing_tool_name: str | None = None
        self._last_tool_error_content: str | None = None
        self._last_tool_success: bool = True
        self._pending_instruction: str | None = None
        self._retry_count: int = 0
        self._max_retries: int = 3
        
        # Attack Graph State
        self._graph_nodes: list[dict[str, Any]] = []
        self._graph_links: list[dict[str, Any]] = []
        self._graph_initialized = False

        # Persistance & Anti-Loop State
        self._tool_history: list[str] = []
        self._max_history: int = 5
        self._consecutive_no_progress_turns: int = 0
        self._finding_detected_this_turn: bool = False
        self._reported_findings_data: set[str] = set()
        self._total_turns: int = 0
        
        # Recursive Attack Queue (Total Domain Domination)
        self._pending_targets: set[str] = set()
        self._processed_targets: set[str] = set()
        
        # Expert Knowledge Hub & Loot
        self.app_dir: Path = Path(self.config.working_directory) / "testinggpt"
        self._knowledge_dir: Path = self.app_dir / "knowledge"
        self._injected_knowledges: set[str] = set()
        self._loot_vault: set[str] = self._load_loot() # Store discovered API keys, passwords, tokens

        # Subscribe to user events
        self.events.subscribe(EventType.USER_COMMAND, self._on_user_command)
        self.events.subscribe(EventType.USER_INPUT, self._on_user_input)

    @property
    def state(self) -> AgentState:
        """Get current agent state."""
        return self._state

    def _set_state(
        self,
        state: AgentState,
        details: str = "",
        target: str | None = None,
        task: str | None = None,
    ) -> None:
        """Update state and emit event.

        Args:
            state: New agent state
            details: Optional details about the state
            target: Optional target for session tracking (used by Langfuse)
            task: Optional full task description for session tracking (used by Langfuse)
        """
        self._state = state
        self.events.emit_state(
            state.value, 
            details, 
            target=target, 
            task=task,
            last_tool_success=self._last_tool_success,
            failed_tool_name=self._last_failing_tool_name
        )

    # === Control Methods (called from TUI) ===

    def pause(self) -> bool:
        """Request pause at next safe point.

        Returns:
            True if pause request was accepted
        """
        if self._state == AgentState.RUNNING:
            self._pause_requested = True
            return True
        return False

    def resume(self, instruction: str | None = None) -> bool:
        """Resume execution from paused or completed state.

        Args:
            instruction: Optional instruction to inject on resume

        Returns:
            True if resume request was accepted
        """
        if self._state in (AgentState.PAUSED, AgentState.COMPLETED):
            print(f"DEBUG: Resuming agent from state {self._state}. Instruction: {instruction[:30] if instruction else 'None'}")
            if instruction:
                self._pending_instruction = instruction
            self._pause_requested = False
            self._waiting_for_input = False
            self._resume_event.set()
            return True
        print(f"DEBUG: Resume ignored - state is {self._state}")
        return False

    def _ensure_graph_target(self, target: str) -> None:
        """Initialize graph with target node."""
        if not self._graph_initialized:
            target_id = f"target-{target}"
            self._graph_nodes.append({
                "id": target_id,
                "label": target,
                "type": "target",
                "status": "primary"
            })
            self._graph_initialized = True
            self.events.emit_graph_update(self._graph_nodes, self._graph_links)

    def _update_graph(self, node_id: str, label: str, node_type: str, parent_id: str | None = None, metadata: dict[str, Any] | None = None) -> None:
        """Update graph with a new node and link."""
        # Avoid duplicates
        if any(n["id"] == node_id for n in self._graph_nodes):
            return

        node = {
            "id": node_id,
            "label": label,
            "type": node_type,
            "metadata": metadata or {}
        }
        self._graph_nodes.append(node)

        if parent_id:
            self._graph_links.append({
                "source": parent_id,
                "target": node_id,
                "type": "discovery"
            })
        
        self.events.emit_graph_update(self._graph_nodes, self._graph_links)

    def reset_session(self) -> None:
        """Clear all intelligent memory and reset the session state."""
        print("DEBUG: Resetting session memory and attack graph...")
        self._graph_nodes = []
        self._graph_links = []
        self._graph_initialized = False
        self._last_failing_tool_name = None
        self._last_tool_error_content = None
        self._last_tool_success = True
        self._tool_history = []
        self._consecutive_no_progress_turns = 0
        self._finding_detected_this_turn = False
        self._reported_findings_data.clear()
        self._total_turns = 0
        
        # Clear backend messages
        if self.backend:
            # We recreate the backend session or just clear history
            asyncio.create_task(self.backend.connect())
        
        # Emit clearing events
        self.events.emit_graph_update([], [])
        self.events.emit_message("Intelligence memory and attack graph have been cleared.", "warning")
        self._set_state(self._state, "Memory Reset")

    def retry(self) -> bool:
        """Retry the last action with context-aware nudge."""
        if self._state == AgentState.PAUSED and not self._last_tool_success:
            tool_name = self._last_failing_tool_name or "unknown"
            error_snippet = (self._last_tool_error_content or "unknown error")[:200]
            nudge = (
                f"Tool '{tool_name}' failed with: {error_snippet}\n"
                f"DO NOT repeat the same command. Analyze the error and proceed using "
                f"DIFFERENT LOGIC, a different attack vector, or adjusted parameters."
            )
            print(f"DEBUG: Triggering Smart Retry for tool '{tool_name}'")
            return self.resume(nudge)
        return False

    def stop(self) -> bool:
        """Request stop.

        Returns:
            True (stop is always accepted)
        """
        self._stop_requested = True
        self._resume_event.set()  # Unblock if paused
        return True

    def inject(self, instruction: str) -> bool:
        """Queue instruction for execution.

        Args:
            instruction: Instruction to inject

        Returns:
            True if instruction was queued
        """
        print(f"DEBUG: Inject called with: {instruction[:30]}... (State: {self._state})")
        if self._state == AgentState.RUNNING:
            self._pending_instruction = instruction
            self._pause_requested = True
            return True
        elif self._state in (AgentState.PAUSED, AgentState.COMPLETED):
            return self.resume(instruction)
        print(f"DEBUG: Inject ignored - state is {self._state}")
        return False

    # === Event Handlers ===

    def _on_user_command(self, event: Event) -> None:
        """Handle user command events."""
        cmd = event.data.get("command")
        if cmd == "pause":
            self.pause()
        elif cmd == "resume":
            self.resume()
        elif cmd == "stop":
            self.stop()

    def _on_user_input(self, event: Event) -> None:
        """Handle user input events."""
        text = event.data.get("text", "")
        if text:
            self.inject(text)

    # === Main Execution ===

    async def run(self, task: str, resume_session_id: str | None = None) -> dict[str, Any]:
        """Run agent with full lifecycle management.

        Args:
            task: Task description for the agent
            resume_session_id: Optional session ID to resume

        Returns:
            Result dictionary with success, output, flags, etc.
        """
        # Reset state
        self._pause_requested = False
        self._stop_requested = False
        self._resume_event.clear()

        # Create or resume session
        if resume_session_id:
            session = self.sessions.load(resume_session_id)
            if not session:
                return {
                    "success": False,
                    "error": f"Session {resume_session_id} not found",
                }
            # Update task if resuming
            if not task:
                task = session.task
        else:
            session = self.sessions.create(
                target=self.config.target,
                task=task,
                model=self.config.llm_model,
            )

        # Create backend if needed
        if self.backend is None:
            import os
            from testinggpt.prompts.testing import get_ctf_prompt
            system_prompt = get_ctf_prompt(self.config.custom_instruction, os_name=os.name)

            if self.config.backend_type == "litellm":
                resolved_key = self.config.get_api_key()
                if isinstance(resolved_key, list):
                    print(f"DEBUG CTRL: Passing {len(resolved_key)} keys to LiteLLMBackend. First: {repr(resolved_key[0][:15])}...")
                elif isinstance(resolved_key, str):
                    print(f"DEBUG CTRL: Passing single key to LiteLLMBackend: {repr(resolved_key[:15])}...")
                else:
                    print(f"DEBUG CTRL: WARNING - resolved_key is {type(resolved_key)}: {resolved_key}")
                self.backend = LiteLLMBackend(
                    working_directory=str(self.config.working_directory),
                    system_prompt=system_prompt,
                    model=self.config.llm_model,
                    api_key=resolved_key,
                    api_base=self.config.llm_api_base,
                    target=self.config.target,
                )
                
                # ─── Dual-Model: Configure strategy model for error recovery ───
                # Auto-configure: if using the fast model, use 70B as strategy advisor
                strategy_model = self.config.strategy_model
                if not strategy_model and "groq/" in self.config.llm_model:
                    # Auto-assign: use NVIDIA 70B as strategy model when running fast 8B
                    nvidia_key = self.config.llama_3_1_70b
                    if not nvidia_key:
                        nvidia_key = os.getenv("llama_3.1_70B") or os.getenv("LLAMA_3_1_70B")
                    if nvidia_key:
                        strategy_model = "nvidia_nim/meta/llama-3.1-70b-instruct"
                        self.backend._strategy_model = strategy_model
                        self.backend._strategy_api_key = nvidia_key.strip(' \t\n\r"')
                        self.backend._strategy_api_base = "https://integrate.api.nvidia.com/v1"
                        print(f"DEBUG CTRL: Dual-model ENABLED. Strategy: {strategy_model}")
                    else:
                        print(f"DEBUG CTRL: Dual-model DISABLED - no NVIDIA key found")
                elif strategy_model:
                    self.backend._strategy_model = strategy_model
                    print(f"DEBUG CTRL: Strategy model set to: {strategy_model}")
                
                # ─── Code Generator: Configure Nemotron 120B for Python scripting ───
                nemotron_key = self.config.nemotron_api_key
                if not nemotron_key:
                    nemotron_key = os.getenv("nemotron-3-super-120b-a12b") or os.getenv("NEMOTRON_API_KEY")
                if nemotron_key:
                    self.backend._codegen_model = f"nvidia_nim/{self.config.nemotron_model}"
                    self.backend._codegen_api_key = nemotron_key.strip(' \t\n\r"')
                    self.backend._codegen_api_base = self.config.nemotron_base_url
                    print(f"DEBUG CTRL: Code Generator ENABLED. Model: {self.backend._codegen_model}")
                else:
                    print(f"DEBUG CTRL: Code Generator DISABLED - no Nemotron key found")
                
            else:
                raise ValueError(f"Unsupported backend type: {self.config.backend_type}")

        try:
            self._set_state(
                AgentState.RUNNING,
                "Connecting...",
                target=self.config.target,
                task=task,
            )
            self._ensure_graph_target(self.config.target)

            # Connect (or resume)
            print(f"DEBUG: Connecting backend to {self.config.target}...")
            if resume_session_id and self.backend.supports_resume:
                backend_session = session.backend_session_id or resume_session_id
                print(f"DEBUG: Resuming backend session {backend_session}...")
                await self.backend.resume(backend_session)
                self.events.emit_message(f"Resumed session {resume_session_id}", "info")
            else:
                print(f"DEBUG: Standard connection initiating...")
                await self.backend.connect()

            # Store backend session ID if available
            if self.backend.session_id:
                self.sessions.set_backend_session_id(self.backend.session_id)

            # Send initial query
            if task:
                print(f"DEBUG: Sending initial task to backend: {task[:50]}...")
                await self.backend.query(task)
            
            self.sessions.update_status(SessionStatus.RUNNING)
            output_parts: list[str] = []
            flags_found: list[str] = []
            self._last_tool_success = True

            # Persistent session loop
            while not self._stop_requested:
                print(f"DEBUG: Entering message receiving loop...")
                self._finding_detected_this_turn = False
                self._total_turns += 1
                async for msg in self.backend.receive_messages():
                    print(f"DEBUG: Received message of type: {msg.type}")
                    # Check stop request
                    if self._stop_requested:
                        break

                    # Check pause request (between messages = safe point)
                    if self._pause_requested:
                        self._pause_requested = False
                        self._set_state(AgentState.PAUSED, "Paused - waiting for input")
                        self.sessions.update_status(SessionStatus.PAUSED)

                        # Wait for resume
                        await self._resume_event.wait()
                        self._resume_event.clear()

                        if self._stop_requested:
                            break

                        # Resume with pending instruction
                        self._set_state(AgentState.RUNNING, "Resumed")
                        self.sessions.update_status(SessionStatus.RUNNING)

                        if self._pending_instruction:
                            self.sessions.add_instruction(self._pending_instruction)
                            self.events.emit_message(
                                f"Injecting: {self._pending_instruction[:50]}...", "info"
                            )
                            await self.backend.query(self._pending_instruction)
                            self._pending_instruction = None

                    # Process message by type
                    await self._process_message(msg, output_parts, flags_found)

                if self._stop_requested:
                    self._set_state(AgentState.IDLE, "Stopped by user")
                    self.sessions.update_status(SessionStatus.PAUSED)
                    break

                # One pass finished. Transition to COMPLETED but stay alive for follow-up
                if self._waiting_for_input:
                    self._set_state(AgentState.PAUSED, "WAITING FOR INPUT - The AI needs more information")
                    self.sessions.update_status(SessionStatus.PAUSED)
                elif self._last_tool_success:
                    # ─── RELENTLESS PERSISTENCE & ANTI-LOOP LOGIC ───
                    
                    # 1. Deep Dive: Finding confirmed but no flag
                    if self._finding_detected_this_turn and not flags_found:
                        self._finding_detected_this_turn = False # Reset for next pass
                        self._consecutive_no_progress_turns = 0
                        
                        nudge_msg = (
                            "🔥 VULNERABILITY CONFIRMED! This is a major breakthrough. "
                            "Now DEEP DIVE: Immediately escalate your findings to read sensitive files, "
                            "extract environment variables, or get a shell. Do NOT just re-report the same data—EXPLOIT IT.\n\n"
                            "PIVOT: If you cannot escalate the current finding immediately, move to a different file, port, or endpoint. "
                            "DO NOT get stuck on one vulnerability."
                        )
                        self.events.emit_message(nudge_msg, "info")
                        await asyncio.sleep(2)
                        await self.backend.query(nudge_msg)
                        continue

                    # 2. Anti-Loop: Detect repetitive failures or stalling
                    if len(self._tool_history) >= 3:
                        last_three = self._tool_history[-3:]
                        if all(cmd == last_three[0] for cmd in last_three):
                            self._tool_history = [] # Clear history to break loop
                            nudge_msg = (
                                "🔄 STRATEGY RESET: You are stuck in a loop trying the same command. "
                                "STOP current vector and pivot to a completely DIFFERENT attack surface. "
                                "If web scanning fails, try port enumeration. If one wordlist fails, try another or a different tool."
                            )
                            self.events.emit_message(nudge_msg, "warning")
                            await asyncio.sleep(2)
                            await self.backend.query(nudge_msg)
                            continue

                    # 3. Mission Incomplete Nudge (Only if no progress for multiple turns)
                    if not flags_found:
                        self._consecutive_no_progress_turns += 1
                        if self._consecutive_no_progress_turns >= 3: # Nudge after 3 turns with no progress
                            self._consecutive_no_progress_turns = 0
                            nudge_msg = (
                                "⚠️ MISSION INCOMPLETE: No flags captured yet. RELENTLESS PERSISTENCE REQUIRED. "
                                "You are FORBIDDEN from stopping until a technical breach is achieved. "
                                "Analyze your previous failures and try a new attack vector (e.g., LFI, SSTI, Brute-force, or custom Python exploit)."
                            )
                            self.events.emit_message(nudge_msg, "warning")
                            await asyncio.sleep(2)
                            await self.backend.query(nudge_msg)
                            continue
                    else:
                        self._consecutive_no_progress_turns = 0

                    # 3.5 Total Domain Domination: Automatic Pivot
                    if self._pending_targets:
                        next_url = sorted(list(self._pending_targets))[0]
                        self._pending_targets.remove(next_url)
                        self._processed_targets.add(next_url)
                        
                        nudge_msg = (
                            f"🌐 NEXT TARGET ACQUIRED: {next_url}\n\n"
                            f"The 'One-by-One' Domination Protocol is ACTIVE. You have successfully mapped the domain. "
                            f"Your mission is to perform a FULL ANALYSIS and AGGRESSIVE EXPLOITATION of this specific page now. "
                            f"Do not report until a breach is attempted on {next_url}."
                        )
                        self.events.emit_message(f"📍 PIVOTING to: {next_url}", "info")
                        await asyncio.sleep(2)
                        await self.backend.query(nudge_msg)
                        continue

                    # NO SURRENDER: Even if flags are found, we keep pushing for more data and more issues
                    # The mission only ends when the USER manually stops it.
                    if flags_found:
                        self._consecutive_no_progress_turns = 0
                        confirmed_list = "\n".join([f"- {f.get('flag', f)}" for f in self.sessions.current.flags_found[-5:]])
                        nudge_msg = (
                            "🏆 BREACH SUCCESSFUL! Technical breakthrough achieved.\n\n"
                            "CONFIRMED FINDINGS SO FAR:\n"
                            f"{confirmed_list}\n\n"
                            "THE MISSION IS NOT OVER. You are ordered to find MORE flags, "
                            "MORE sensitive data, and MORE vulnerabilities.\n\n"
                            "CRITICAL: You MUST pivot to a DIFFERENT attack surface. Do NOT re-report the findings listed above. "
                            "Move to the next file, a different API endpoint, or unrelated secrets.\n"
                            "RELENTLESS EXPLORATION IS MANDATORY."
                        )
                        self.events.emit_message(nudge_msg, "info")
                        await asyncio.sleep(2)
                        await self.backend.query(nudge_msg)
                        continue 
                    else:
                        # If no flags and no stop, we MUST keep fighting
                        # Fallback nudge if we somehow reached here
                        nudge_msg = "🚨 PROTOCOL VIOLATION: No breach detected. RESUME ATTACK IMMEDIATELY. Try another vector or write a Python exploit."
                        self.events.emit_message(nudge_msg, "error")
                        await asyncio.sleep(2)
                        await self.backend.query(nudge_msg)
                        continue

                    # 4. Proactive Strategy Advisor: Turn-based re-evaluation
                    if self._total_turns % 5 == 0:
                        nudge_msg = (
                            "💡 STRATEGY ADVISOR CHECKPOINT: You have completed 5 turns. "
                            "Stop and RE-EVALUATE the entire attack surface. "
                            "Are there ports you haven't scanned? Wordlists you haven't finished? "
                            "WAF bypasses you haven't tried? Proactively design a new, MORE AGGRESSIVE "
                            "attack chain now. Focus on TIER 3 (Relentless Breach) techniques."
                        )
                        self.events.emit_message(nudge_msg, "info")
                        await asyncio.sleep(2)
                        await self.backend.query(nudge_msg)
                        continue
                else:
                    # TOOL FAILURE — Handle Auto-Retry logic
                    tool_name = self._last_failing_tool_name or "unknown"
                    error_msg = self._last_tool_error_content or "No error output"
                    
                    if self._retry_count < self._max_retries:
                        self._retry_count += 1
                        msg = f"⚠️ Tool '{tool_name}' failed. (Attempt {self._retry_count}/{self._max_retries}). initiating auto-retry in 30s with alternative strategy..."
                        self.events.emit_message(msg, "warning")
                        
                        # Wait 30 seconds with periodic countdown updates or until manual resume
                        self._resume_event.clear()
                        for i in range(30, 0, -5):
                            if self._stop_requested: break
                            if self._resume_event.is_set(): break
                            
                            self._set_state(AgentState.PAUSED, f"Auto-retry in {i}s...")
                            try:
                                await asyncio.wait_for(self._resume_event.wait(), timeout=5.0)
                                break # If resume event was set, exit the loop
                            except asyncio.TimeoutError:
                                pass # Keep counting down
                        
                        if not self._stop_requested:
                            # Build a strong "Strategy Reset" instruction
                            retry_instruction = (
                                f"AUTORETRY MISSION (Attempt {self._retry_count}/{self._max_retries}):\n"
                                f"The previous attempt using '{tool_name}' failed with the following error:\n"
                                f"--- ERROR START ---\n{error_msg[:400]}\n--- ERROR END ---\n\n"
                                f"MANDATORY: DO NOT repeat the same command or approach. It clearly failed. "
                                f"Try a COMPLETELY DIFFERENT method or tool to achieve the objective on target {self.config.target}. "
                                f"For example, if a port scan failed, try a web crawler; if specialized exploit failed, try general enumeration."
                            )
                            self.events.emit_message(f"🔄 Retrying with alternative strategy (Attempt {self._retry_count})...", "info")
                            self._set_state(AgentState.RUNNING, "Retrying mission...")
                            await self.backend.query(retry_instruction)
                            continue # Restart the async iterator loop
                    else:
                        # Max retries reached
                        self._retry_count = 0 # Reset for next session
                        msg = f"Mission stalled: Tool '{tool_name}' failed after {self._max_retries} attempts. Check assessment and try a different approach manually."
                        self._set_state(AgentState.PAUSED, f"Mission stalled - {tool_name} failed")
                        self.sessions.update_status(SessionStatus.PAUSED)
                        self.events.emit_message(msg, "warning")
                
                print(f"DEBUG: Agent reached end of stream. State: {self._state}. Waiting for input...")

                # Wait for user follow-up (triggered via resume event)
                print(f"DEBUG: Agent entering COMPLETED wait state...")
                await self._resume_event.wait()
                print(f"DEBUG: Agent woke up from COMPLETED wait! Instruction: {self._pending_instruction[:30] if self._pending_instruction else 'None'}")
                self._resume_event.clear()

                if self._stop_requested:
                    break

                # Resume with pending instruction
                if self._pending_instruction:
                    self._set_state(AgentState.RUNNING, "Processing follow-up...")
                    self.sessions.update_status(SessionStatus.RUNNING)
                    self.sessions.add_instruction(self._pending_instruction)
                    self.events.emit_message(
                        f"Follow-up: {self._pending_instruction[:50]}...", "info"
                    )
                    await self.backend.query(self._pending_instruction)
                    self._pending_instruction = None
                    # Loop back to receive_messages

            return {
                "success": True,
                "output": "\n".join(output_parts),
                "flags_found": flags_found,
                "session_id": session.session_id,
                "cost_usd": session.total_cost_usd,
            }

        except Exception as e:
            self._last_tool_success = False
            self._last_failing_tool_name = "LLM/System"
            self._set_state(AgentState.PAUSED, f"System Error: {str(e)[:100]}")
            self.sessions.set_error(str(e))
            self.sessions.update_status(SessionStatus.ERROR)
            
            # Emit warning message to trigger RETRY visibility
            self.events.emit_message(
                f"Critical Error: {str(e)[:100]}. Mission stalled. Try clicking RETRY or clearing system.", 
                "warning"
            )
            
            return {"success": False, "error": str(e)}

        finally:
            if self.backend:
                await self.backend.disconnect()

    async def _process_message(
        self, msg: AgentMessage, output_parts: list[str], flags_found: list[str]
    ) -> None:
        """Process a single agent message.

        Args:
            msg: Message to process
            output_parts: List to append text output to
            flags_found: List to append found flags to
        """
        if msg.type == MessageType.TEXT:
            output_parts.append(msg.content)
            self.events.emit_message(msg.content)

            # Detect flags
            detected_flags = self._detect_flags(msg.content)
            for flag in detected_flags:
                if flag not in flags_found:
                    flags_found.append(flag)
                    context = msg.content[:300] + "..." if len(msg.content) > 300 else msg.content
                    self.sessions.add_flag(flag, context)
                    self.events.emit_flag(flag, context)
                    
                    # Also add as a Finding to the ledger for the new Interactive UI
                    self.events.emit_finding({
                        "type": "🏁 FLAG CAPTURED",
                        "severity": "CRITICAL",
                        "confidence": "100",
                        "description": f"Successfully retrieved flag: {flag}",
                        "exploit_details": f"VICTORY! This unique string is your reward for successfully exploiting the target. In the world of Cyber Security and CTF (Capture The Flag) competitions, this format (flag{{...}}) is the industry standard for proof-of-work. Its random-looking nature ensures it cannot be guessed—it must be EARNED through technical exploitation.\n\nCaptured from output:\n{context}"
                    })

            # Detect other findings (vulnerabilities)
            detected_findings = self._detect_findings(msg.content)
            for finding in detected_findings:
                # Deduplication check
                evidence = finding.get("data") or finding.get("description")
                if evidence:
                    # Clean up evidence for consistent matching
                    clean_evidence = re.sub(r'\s+', '', evidence)
                    if clean_evidence in self._reported_findings_data:
                        print(f"DEBUG: Skipping duplicate finding: {finding['type']} with evidence hash shortcut")
                        continue
                    self._reported_findings_data.add(clean_evidence)

                self._finding_detected_this_turn = True
                self.events.emit_finding(finding)
                
                # Update Attack Graph
                target_id = f"target-{self.config.target}"
                vuln_id = f"vuln-{finding['type']}-{hash(str(evidence)) % 10000}"
                self._update_graph(
                    node_id=vuln_id,
                    label=f"VULN: {finding['type']}",
                    node_type="vulnerability",
                    parent_id=target_id,
                    metadata={
                        "severity": finding['severity'], 
                        "confidence": finding['confidence'],
                        "description": finding['description'],
                        "status": "confirmed" if "100" in str(finding['confidence']) else "potential"
                    }
                )

            # Detect assessment phases to update mission status
            phase_match = re.search(r"### (STAGE \d: )?(?P<phase>ASSESSMENT|EXECUTION|RECONNAISSANCE|EXPLOITATION)", msg.content, re.IGNORECASE)
            if phase_match:
                phase_name = phase_match.group("phase").upper()
                self._update_graph(
                    node_id=f"phase-{phase_name}",
                    label=f"PHASE: {phase_name}",
                    node_type="process",
                    parent_id=f"target-{self.config.target}",
                    metadata={"status": "active"}
                )

            # Detect interactive questions
            question_match = re.search(r"<ask_user>(?P<question>[\s\S]*?)</ask_user>", msg.content, re.IGNORECASE)
            if question_match:
                question = question_match.group("question").strip()
                self._waiting_for_input = True
                self.events.emit_input_required(question)
                print(f"DEBUG: Agent requested user input: {question[:50]}...")

            # ─── Total Domain Domination: Link Discovery ───
            # Matches '[PAGE] https://path' from DomainCrawlerTool
            for match in re.finditer(r"\[PAGE\]\s+(?P<url>https?://[^\s\n]+)", msg.content):
                found_url = match.group("url").strip()
                if found_url not in self._processed_targets and found_url not in self._pending_targets:
                    self._pending_targets.add(found_url)
                    self.events.emit_message(f"🔗 TARGET QUEUED: {found_url}", "info")
                    print(f"DEBUG: Added {found_url} to target queue. Total: {len(self._pending_targets)}")

            # ─── Expert Knowledge Injection: Technology-Based ───
            # Detected via Tech Fingerprint or messages
            tech_map = {
                "WordPress": "wordpress_domination.md",
                "API": "api_cracking.md",
                "Cloud": ["cloud_breach.md", "zero_trust_bypass.md"],
                "AWS": "cloud_breach.md", "Azure": "cloud_breach.md", "GCP": "cloud_breach.md",
                "Database": "database_domination.md", "MySQL": "database_domination.md", "Postgres": "database_domination.md", "Redis": "database_domination.md", "MongoDB": "database_domination.md",
                "Linux": "priv_esc_linux.md", "Ubuntu": "priv_esc_linux.md", "Debian": "priv_esc_linux.md",
                "Windows": "priv_esc_windows.md", "Active Directory": "ActiveDirectory_Exploitation.md", "AD": "ActiveDirectory_Exploitation.md",
                "Shopify": "ecommerce_cracking.md", "Magento": "ecommerce_cracking.md", "WooCommerce": "ecommerce_cracking.md",
                "PHP": "LFI_to_RCE_Mastery.md", "LFI": "LFI_to_RCE_Mastery.md", "RCE": "LFI_to_RCE_Mastery.md"
            }
            
            for tech, playbooks in tech_map.items():
                if tech.lower() in msg.content.lower() and tech not in self._injected_knowledges:
                    if isinstance(playbooks, str):
                        playbooks = [playbooks]
                    
                    for playbook in playbooks:
                        content = self._read_knowledge(playbook)
                        if content:
                            self._injected_knowledges.add(tech)
                            self.events.emit_message(f"🧠 KNOWLEDGE INJECTED: {tech} Playbook ({playbook})", "success")
                            nudge_msg = f"[!!! EXPERT KNOWLEDGE INJECTED !!!]\n\n{content}\n\nUSE THIS PLAYBOOK NOW TO DOMINATE THE {tech.upper()} LAYER."
                            asyncio.create_task(self.backend.query(nudge_msg))

            # ─── Loot Tracker: Capturing secrets ───
            # Automatically find strings that look like secrets/keys
            secret_patterns = [
                r"AIza[0-9A-Za-z-_]{35}", # Google
                r"AKIA[0-9A-Z]{16}", # AWS
                r"xox[pb]-[0-9]{12}-[0-9]{12}-[0-9]{12}-[a-z0-9]{32}", # Slack
                r"sk_test_[0-9a-zA-Z]{24}" # Stripe
            ]
            for pattern in secret_patterns:
                for match in re.finditer(pattern, msg.content):
                    secret = match.group(0)
                    if secret not in self._loot_vault:
                        self._loot_vault.add(secret)
                        self._save_loot()
                        self.events.emit_message(f"🔑 LOOT CAPTURED: {secret[:10]}...", "success")
                        print(f"DEBUG: Loot captured: {secret}")

        elif msg.type == MessageType.TOOL_START:
            self.events.emit_tool(
                status="start",
                name=msg.tool_name or "unknown",
                args=msg.tool_args,
            )
            # Track tool command to detect loops
            if msg.tool_name == "terminal_execute" and msg.tool_args and "command" in msg.tool_args:
                cmd = str(msg.tool_args["command"])
                self._tool_history.append(cmd)
                if len(self._tool_history) > self._max_history:
                    self._tool_history.pop(0)

            # Add tool execution to graph
            target_id = f"target-{self.config.target}"
            tool_id = f"tool-{msg.tool_name}-{hash(json.dumps(msg.tool_args or {})) % 10000}"
            self._update_graph(
                node_id=tool_id,
                label=f"RUN: {msg.tool_name}",
                node_type="process",
                parent_id=target_id,
                metadata={"status": "running", "args": msg.tool_args}
            )

        elif msg.type == MessageType.TOOL_RESULT:
            self._last_tool_success = msg.tool_success
            if not msg.tool_success:
                self._last_failing_tool_name = msg.tool_name
                self._last_tool_error_content = msg.content
                print(f"DEBUG: Tool {msg.tool_name} failed. Error captured for Retry logic.")
            else:
                # Update existing tool node to completed
                # This is a bit tricky as IDs might change if args are huge, but hash should hold
                tool_id = f"tool-{msg.tool_name}-{hash(json.dumps(msg.tool_args or {})) % 10000}"
                # We don't have a specific 'update existing node' in _update_graph yet, 
                # but we can call it again and rely on the skip-if-exists check if we want, 
                # however we want to update the metadata. Let's just create a discovery link.
                
                # If tool was successful, and was a check_exploits call, add matches to graph
                if msg.tool_name == "check_exploits" and msg.content:
                    target_id = f"target-{self.config.target}"
                    exp_id = f"exploit-{hash(msg.content) % 10000}"
                    self._update_graph(
                        node_id=exp_id,
                        label="Exploit Search Match",
                        node_type="exploit",
                        parent_id=target_id,
                        metadata={"details": msg.content[:200]}
                    )

            self.events.emit_tool(
                status="complete",
                name=msg.tool_name or "unknown",
                result=msg.content,
            )

        elif msg.type == MessageType.RESULT:
            cost = msg.metadata.get("cost_usd", 0)
            if cost > 0:
                self.sessions.add_cost(cost)
            
            # Suppress "Turn complete" message if a relentless nudge is about to happen
            should_suppress = (self._finding_detected_this_turn or not flags_found) and not self._stop_requested
            
            if not should_suppress:
                self.events.emit_message(f"Mission Result: {msg.content}", "info", metadata={"cost": self.sessions.current.total_cost_usd if self.sessions.current else 0})
            else:
                # Still emit the cost update but hide the confusing text
                self.events.emit_message("Turn analysis complete. Strategizing next move...", "info")

        elif msg.type == MessageType.ERROR:
            self.events.emit_message(f"✗ ERROR: {msg.content}", "error")

        elif msg.type == MessageType.COOLDOWN:
            seconds = msg.content.get("seconds", 60)
            error = msg.content.get("error", "Unknown")
            self.events.emit_cooldown(seconds, error)
            self.events.emit_message(f"⏳ RATE LIMIT: Global backoff triggered ({seconds}s). AI is resting... (Reason: {error})", "warning")

    def _detect_flags(self, text: str) -> list[str]:
        """Detect potential flags in text.

        Args:
            text: Text to search for flags

        Returns:
            List of detected flag strings
        """
        flags = []
        for pattern in self.FLAG_PATTERNS:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                flag = match.group(0)
                if flag not in flags:
                    flags.append(flag)
        return flags

    def _detect_findings(self, text: str) -> list[dict[str, Any]]:
        """Detect potential findings (vulnerabilities) in text.

        Args:
            text: Text to search for findings

        Returns:
            List of detected finding dictionaries
        """
        findings = []
        # Improved pattern to match findings more flexibly, now including a DATA field for raw leaks
        pattern = r"\*\*(?:VULNERABILITY FOUND|FOUND VULNERABILITY|FINDING|FLAG CAPTURED):\*\* (?P<type>.*?)\s*[\n\r]\s*-? \*\*SEVERITY:\*\* (?P<severity>.*?)\s*[\n\r]\s*(?:-? \*\*CONFIDENCE:\*\* (?P<confidence>.*?)\s*[\n\r]\s*)?(?:-? \*\*WAF STATUS:\*\* (?P<waf_status>.*?)\s*[\n\r]\s*)?-? \*\*DESCRIPTION:\*\* (?P<description>[\s\S]*?)(?:\s*[\n\r]\s*-? \*\*DATA:\*\* (?P<data>[\s\S]*?))?(?:\s*[\n\r]\s*-? \*\*EXPLOIT DETAILS:\*\* (?P<exploit_details>[\s\S]*?))?(?=\n\n|\n\s*\n|\n\*\*|###|$)"
        
        for match in re.finditer(pattern, text, re.IGNORECASE):
            finding_type = match.group("type").strip()
            # Filter out redundant progress summaries
            if any(term in finding_type.lower() for term in ["remaining flags", "progress", "mission status"]):
                continue
                
            findings.append({
                "type": finding_type,
                "severity": match.group("severity").strip(),
                "confidence": match.group("confidence").strip() if match.group("confidence") else "85",
                "description": match.group("description").strip(),
                "data": match.group("data").strip() if match.group("data") else None,
                "waf_status": match.group("waf_status").strip() if match.group("waf_status") else "NOT_DETECTED",
                "exploit_details": match.group("exploit_details").strip() if match.group("exploit_details") else None
            })
        return findings

    def _read_knowledge(self, filename: str) -> str | None:
        """Read a playbook from the knowledge hub."""
        try:
            p = self._knowledge_dir / filename
            if p.exists():
                return p.read_text(encoding="utf-8")
        except:
            pass
        return None

    def _save_loot(self) -> None:
        """Save captured loot to a persistent file."""
        import json
        try:
            loot_file = self.app_dir / "loot_vault.json"
            with open(loot_file, "w") as f:
                json.dump(list(self._loot_vault), f)
        except Exception as e:
            print(f"DEBUG: Error saving loot: {e}")

    def _load_loot(self) -> Set[str]:
        """Load captured loot from a persistent file."""
        import json
        try:
            loot_file = self.app_dir / "loot_vault.json"
            if loot_file.exists():
                with open(loot_file, "r") as f:
                    return set(json.load(f))
        except Exception as e:
            print(f"DEBUG: Error loading loot: {e}")
        return set()
