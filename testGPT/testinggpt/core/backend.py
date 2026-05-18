import re
import json
import logging
import asyncio
import litellm
import time

# Aggressively silence LiteLLM and underlying handlers at module level
litellm.set_verbose = False
litellm.suppress_debug_info = True
litellm.add_all_model_info = False

logging.getLogger('LiteLLM').setLevel(logging.CRITICAL)
logging.getLogger('httpcore').setLevel(logging.CRITICAL)
logging.getLogger('httpx').setLevel(logging.CRITICAL)
logging.getLogger('openai').setLevel(logging.CRITICAL)
logging.getLogger('aiohttp').setLevel(logging.CRITICAL)

from abc import ABC, abstractmethod
from collections.abc import AsyncIterator
from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class MessageType(Enum):
    """Framework-agnostic message types from agent backends."""

    TEXT = "text"
    TOOL_START = "tool_start"
    TOOL_RESULT = "tool_result"
    RESULT = "result"
    ERROR = "error"
    COOLDOWN = "cooldown"


@dataclass
class AgentMessage:
    """Framework-agnostic message from any agent backend."""

    type: MessageType
    content: Any
    tool_name: str | None = None
    tool_args: dict[str, Any] | None = None
    tool_success: bool = True
    metadata: dict[str, Any] = field(default_factory=dict)


class AgentBackend(ABC):
    """
    Abstract interface for agent backends.

    Implement this to support different frameworks:
    - ClaudeCodeBackend (current)
    - OpenAIBackend (future)
    - LocalLLMBackend (future)
    """

    @abstractmethod
    async def connect(self) -> None:
        """Establish connection to the agent."""
        ...

    @abstractmethod
    async def disconnect(self) -> None:
        """Close connection."""
        ...

    @abstractmethod
    async def query(self, prompt: str) -> None:
        """Send a query/instruction to the agent."""
        ...

    @abstractmethod
    def receive_messages(self) -> AsyncIterator[AgentMessage]:
        """Async iterator yielding messages from agent."""
        ...

    @property
    @abstractmethod
    def session_id(self) -> str | None:
        """Current session ID (if backend supports sessions)."""
        ...

    @property
    def supports_resume(self) -> bool:
        """Whether this backend supports session resume."""
        return False

    @abstractmethod
    async def resume(self, session_id: str) -> bool:
        """Resume a previous session. Returns success."""
        ...




class LiteLLMBackend(AgentBackend):
    """Universal LLM implementation using LiteLLM."""

    def __init__(
        self,
        working_directory: str,
        system_prompt: str,
        model: str,
        api_key: str | list[str] | None = None,
        api_base: str | None = None,
        target: str = "unknown",
    ):
        self._cwd = working_directory
        self._system_prompt = system_prompt
        self._model = model
        self._target = target
        
        # Handle multiple keys for rotation
        if isinstance(api_key, list):
            self._api_keys = api_key
            self._current_key_index = 0
            self._api_key = self._api_keys[0] if self._api_keys else None
        else:
            self._api_keys = [api_key] if api_key else []
            self._current_key_index = 0
            self._api_key = api_key

        self._api_base = api_base
        self._messages: list[dict[str, Any]] = []
        self._is_connected = False
        self._session_id = None
        self._pending_query = None
        
        # Track cooldowns for keys: {index: timestamp_of_failure}
        self._key_cooldowns: dict[int, float] = {}
        self._COOLDOWN_DURATION = 60 # Seconds to wait before retrying a limited key
        
        # Context management constants
        self._MAX_MESSAGE_CHARS = 20000
        self._SAFE_TOTAL_HISTORY_LENGTH = 100000
        
        # Thought process tracking
        self._current_thought: str | None = None
        
        # Intelligence tracking
        self._consecutive_tool_failures: int = 0
        self._key_findings: list[str] = []  # Persistent memory of important discoveries
        
        # Dual-model: strategy model for recovery (set externally if available)
        self._strategy_model: str | None = None
        self._strategy_api_key: str | None = None
        self._strategy_api_base: str | None = None
        
        # Code generator: Nemotron 120B for writing Python scripts (set externally)
        self._codegen_model: str | None = None
        self._codegen_api_key: str | None = None
        self._codegen_api_base: str | None = None

    def _rotate_key(self) -> bool:
        """
        Rotate to the next available API key that is not in cooldown.
        Returns True if a fresh key was found.
        """
        if len(self._api_keys) <= 1:
            return False
            
        now = time.time()
        self._key_cooldowns[self._current_key_index] = now
        
        for _ in range(len(self._api_keys) - 1):
            self._current_key_index = (self._current_key_index + 1) % len(self._api_keys)
            cooldown_time = self._key_cooldowns.get(self._current_key_index, 0)
            
            if now - cooldown_time > self._COOLDOWN_DURATION:
                self._api_key = self._api_keys[self._current_key_index]
                return True
        
        return False

    # ─── IMPROVEMENT #4: Smart Tool Output Memory ───────────────────────────

    # Patterns to extract from long output (key intelligence)
    _FINDING_PATTERNS = [
        (r'(\d+)/tcp\s+open\s+(\S+)', 'OPEN_PORT'),         # nmap open ports
        (r'(\d+)/udp\s+open\s+(\S+)', 'OPEN_PORT'),         # nmap UDP
        (r'HTTP/[\d.]+\s+(\d{3})', 'HTTP_STATUS'),           # HTTP status codes
        (r'(CVE-\d{4}-\d+)', 'CVE'),                          # CVE references
        (r'(Apache/[\d.]+|nginx/[\d.]+|IIS/[\d.]+)', 'SERVER_VERSION'),  # Server versions
        (r'(PHP/[\d.]+|Python/[\d.]+|Node\.js/[\d.]+)', 'TECH_VERSION'),  # Tech versions
        (r'(WordPress\s[\d.]+|Joomla\s[\d.]+|Drupal\s[\d.]+)', 'CMS'),    # CMS detection
        (r'(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})', 'IP_ADDRESS'),           # IP addresses
        (r'flag\{[^}]+\}', 'FLAG'),                           # CTF flags
        (r'(SQL\s*(?:injection|error|syntax))', 'SQLI_HINT'), # SQL injection hints
        (r'(X-Powered-By:\s*\S+)', 'HEADER'),                 # Interesting headers
        (r'(Set-Cookie:\s*\S+)', 'COOKIE'),                   # Cookies
        (r'(Location:\s*\S+)', 'REDIRECT'),                   # Redirects
        (r'(\S+\.(?:php|asp|aspx|jsp|cgi|pl|py))\b', 'SCRIPT_FILE'),  # Script files
        (r'(AIza[0-9A-Za-z-_]{35})', 'GOOGLE_API_KEY'),      # Google Cloud API Key
        (r'(sk-[a-zA-Z0-9]{48})', 'OPENAI_API_KEY'),        # OpenAI API Key
        (r'(nvapi-[a-zA-Z0-9-_]{64})', 'NIM_API_KEY'),      # NVIDIA NIM API Key
        (r'(eyJ[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+)', 'JWT_TOKEN'), # JWT
        (r'(AKIA[0-9A-Z]{16})', 'AWS_ACCESS_KEY'),          # AWS Access Key ID
        (r'(mongodb(?:\+srv)?://\S+)', 'DB_CONNECTION_STRING'), # MongoDB Connection
        (r'postgresql://\S+', 'DB_CONNECTION_STRING'),       # Postgres Connection
        (r'mysql://\S+', 'DB_CONNECTION_STRING'),            # MySQL Connection
        (r'-----\s*BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY\s*-----', 'PRIVATE_KEY'), # Private Keys
        (r'(https://hooks\.slack\.com/services/\S+)', 'SLACK_WEBHOOK'),      # Slack webhooks
        (r'(https://discord\.com/api/webhooks/\S+)', 'DISCORD_WEBHOOK'),      # Discord webhooks
        (r'(AIza[0-9A-Za-z-_]{35})', 'FIREBASE_API_KEY'),     # Firebase API Key
        (r'([a-f0-9]{32}-[a-f0-9]{32})', 'HEROKU_API_KEY'),    # Heroku API Key (common format)
        (r'SG\.[a-zA-Z0-9-_]{22}\.[a-zA-Z0-9-_]{43}', 'SENDGRID_API_KEY'), # SendGrid
        (r'key-[a-zA-Z0-9]{32}', 'MAILGUN_API_KEY'),         # Mailgun
        (r'(?:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', 'EMAIL_INFO'), # Emails
        (r'(?:[a-f0-9]{2}:){15}[a-f0-9]{2}', 'SSH_FINGERPRINT'), # SSH Fingerprints
        (r'sk_live_[0-9a-zA-Z]{24}', 'STRIPE_SECRET_KEY'),      # Stripe
        (r'pk_live_[0-9a-zA-Z]{24}', 'STRIPE_PUBLISHABLE_KEY'), # Stripe
        (r'EOAA[a-zA-Z0-9]{100,}', 'FB_ACCESS_TOKEN'),         # Facebook
        (r'AAAA[a-zA-Z0-9_-]{7}:[a-zA-Z0-9_-]{140}', 'FCM_SERVER_KEY'), # Firebase Cloud Messaging
        (r'sq0csp-[0-9a-zA-Z-_]{43}', 'SQUARE_ACCESS_TOKEN'),   # Square
        (r'access_token\$production\$[0-9a-z]{16}\$[0-9a-f]{32}', 'Braintree_ACCESS_TOKEN'), # Braintree
    ]

    # Common documentation placeholders and test keys to ignore/de-prioritize
    _PLACEHOLDER_PATTERNS = [
        r"^AKIA[A-Z0-9]*EXAMPLE$",
        r"^EXAMPLE$",
        r"^YOUR_[A-Z_]+$",
        r"^pk_test_[0-9a-zA-Z]+$",
        r"^sk_test_[0-9a-zA-Z]+$",
        r"^AIzaSy[A-Z0-9_-]{33}$",
        r"^00000000000000000000000000000000$",
        r"^1234567890abcdef1234567890abcdef$",
    ]

    def _smart_summarize(self, content: str, max_chars: int | None = None) -> str:
        """
        Intelligently summarize tool output:
        - Extract key findings (unconditional)
        - Short output: keep as-is
        - Medium output: keep start/end + extract key findings
        - Large output: extract only key findings with context
        """
        if not content:
            return ""

        # ─── ALWAYS Extract key findings for the UI/Ledger ───
        findings = []
        from testinggpt.core.events import EventBus
        events = EventBus.get()
        
        for pattern, finding_type in self._FINDING_PATTERNS:
            for match in re.finditer(pattern, content, re.IGNORECASE):
                finding_text = match.group(0).strip()
                if finding_text and finding_text not in findings:
                    findings.append(f"[{finding_type}] {finding_text}")
                    # Store in persistent memory
                    if finding_text not in self._key_findings:
                        self._key_findings.append(finding_text)
                        
                        # Emit finding event for UI
                        # Check if it's a known placeholder
                        is_placeholder = any(re.search(p, finding_text, re.IGNORECASE) for p in self._PLACEHOLDER_PATTERNS)
                        
                        low_sev_types = ['EMAIL_INFO', 'IP_ADDRESS', 'SERVER_VERSION', 'TECH_VERSION', 'HTTP_STATUS']
                        severity = "Info" if (finding_type in low_sev_types or is_placeholder) else "High"
                        confidence = 20 if is_placeholder else 98
                        
                        if is_placeholder:
                            description = f"Potential placeholder or documentation string detected: {finding_text}. This is likely a false positive."
                        else:
                            description = f"Automatically discovered {finding_type} in tool output: {finding_text}"
                        
                        events.emit_finding({
                            "type": f"{'PLACEHOLDER' if is_placeholder else 'Sensitive Data'}: {finding_type}",
                            "severity": severity,
                            "description": description,
                            "evidence": finding_text,
                            "mitigation": "No action needed if it's a placeholder. If real, rotate the compromised secret immediately.",
                            "thought": f"The 'Smart Summarizer' identified a string matching {finding_type}.",
                            "confidence": confidence,
                            "waf_status": "NOT DETECTED"
                        })

        limit = max_chars or self._MAX_MESSAGE_CHARS
        if len(content) <= limit:
            return content
        
        # Build smart summary
        findings_section = ""
        if findings:
            findings_section = (
                "\n\n=== KEY FINDINGS EXTRACTED ==="
                "\n" + "\n".join(findings[:30]) +  # Cap at 30 findings
                "\n=== END FINDINGS ==="
            )
        
        # Keep meaningful beginning and end
        keep = (limit - len(findings_section)) // 2
        keep = max(keep, 1000)  # Always keep at least 1000 chars from each end
        
        summarized = (
            f"{content[:keep]}"
            f"{findings_section}"
            f"\n\n[... {len(content) - (keep * 2)} chars summarized for context stability ...]\n\n"
            f"{content[-keep:]}"
        )
        return summarized

    # ─── IMPROVEMENT #6: Code Generator (Nemotron 120B) ─────────────────────

    async def _code_generate(self, failed_command: str, error_output: str, goal: str = "") -> str | None:
        """
        Use the Nemotron 120B model to write a Python script that replaces
        a failing tool/command. Includes self-healing: if the script has errors,
        the error is sent back to Nemotron to fix (up to 2 retries).
        """
        if not self._codegen_model or not self._codegen_api_key:
            return None
        
        from testinggpt.core.events import EventBus
        events = EventBus.get()
        
        import platform
        import tempfile
        import asyncio
        import os
        
        os_name = platform.system()
        error_reason = error_output[:300] if error_output else "Unknown error"
        max_attempts = 3  # 1 initial + 2 retries
        
        # Build the initial conversation for Nemotron
        messages = [
            {"role": "system", "content": (
                "You are an expert Python security scripting agent. You write scripts for penetration testing.\n"
                "You have deep knowledge of: port scanning, web scraping, SQL injection testing, XSS detection, "
                "directory brute-forcing, banner grabbing, credential testing, SSL analysis, DNS enumeration, "
                "and network reconnaissance.\n"
                "Available Python libraries: requests, socket, ssl, urllib, subprocess, http.client, "
                "json, re, base64, hashlib, struct, threading, concurrent.futures.\n"
                "Optional libraries (may or may not be installed): paramiko, beautifulsoup4, scapy, impacket, pwntools.\n"
                "Output ONLY raw Python code, no markdown, no explanation.\n"
                "CRITICAL: The script will be run as `python script.py` with NO command-line arguments. "
                "You MUST hardcode the target URL, ports, and any other parameters from the failed command directly into the script variable/constants. "
                "Do NOT use argparse or input()."
            )},
            {"role": "user", "content": (
                f"You are a Python security scripting expert. A pentesting tool failed on {os_name}.\n\n"
                f"FAILED COMMAND: {failed_command}\n"
                f"ERROR: {error_output[:500]}\n"
                f"MISSION TARGET: {self._target}\n"
                f"GOAL: {goal or 'Achieve what the failed command was supposed to do'}\n\n"
                f"Write a COMPLETE, SELF-CONTAINED Python script that achieves the same goal on target: {self._target}. "
                f"Prefer standard library but you can use requests, beautifulsoup4, paramiko if needed.\n\n"
                "RULES:\n"
                "1. The script MUST be runnable with `python script.py` with NO arguments.\n"
                f"2. You MUST hardcode the MISSION TARGET ({self._target}) and other parameters from the FAILED COMMAND into the script. NEVER use 'scanme.nmap.org' or 'example.com'.\n"
                "3. Print ALL results to stdout in a clear, structured format\n"
                "4. Include proper error handling and timeouts\n"
                "5. Do NOT use the tool that failed — implement the logic in pure Python\n"
                "6. Output ONLY the Python code, nothing else. No markdown, no explanation.\n"
                "7. For port scanning: use socket with threading for speed\n"
                "8. For web testing: use requests with proper headers and SSL verification disabled\n"
                "9. Print results as they are found, don't wait until the end\n"
                "10. No argparse, no input()."
            )}
        ]
        
        for attempt in range(max_attempts):
            attempt_label = f"Attempt {attempt + 1}/{max_attempts}"
            
            # Phase 1: GENERATING
            events.emit_codegen(
                status="generating",
                failed_tool=failed_command,
                error_reason=error_reason if attempt == 0 else f"[RETRY {attempt}] Fixing script errors...",
            )
            
            try:
                print(f"DEBUG: [CODEGEN] {attempt_label} — Streaming from {self._codegen_model}...")
                
                # Stream the response so user sees code being written in real-time
                script_chunks = []
                last_emit_len = 0
                
                response = await litellm.acompletion(
                    model=self._codegen_model,
                    messages=messages,
                    api_key=self._codegen_api_key,
                    api_base=self._codegen_api_base,
                    num_retries=1,
                    stream=True
                )
                
                async for chunk in response:
                    delta = chunk.choices[0].delta
                    if delta and delta.content:
                        script_chunks.append(delta.content)
                        current_script = "".join(script_chunks)
                        
                        # Emit partial update every ~200 chars so UI shows live progress
                        if len(current_script) - last_emit_len >= 200:
                            last_emit_len = len(current_script)
                            events.emit_codegen(
                                status="streaming",
                                failed_tool=failed_command,
                                error_reason=f"{attempt_label} — Writing code... ({len(current_script)} chars)",
                                script=current_script,
                            )
                
                script = "".join(script_chunks).strip()
                
                # Clean up markdown fences
                if script.startswith("```python"):
                    script = script[len("```python"):].strip()
                if script.startswith("```"):
                    script = script[3:].strip()
                if script.endswith("```"):
                    script = script[:-3].strip()
                
                print(f"DEBUG: [CODEGEN] {attempt_label} — Generated {len(script)} chars. Executing...")
                
                # Phase 2: EXECUTING — emit full script
                events.emit_codegen(
                    status="executing",
                    failed_tool=failed_command,
                    error_reason=f"{attempt_label} — Script complete ({len(script)} chars), executing...",
                    script=script,
                )
                
                # Save and execute
                script_path = os.path.join(tempfile.gettempdir(), f"testinggpt_codegen_{int(time.time())}_{attempt}.py")
                with open(script_path, "w", encoding="utf-8") as f:
                    f.write(script)
                
                try:
                    process = await asyncio.create_subprocess_exec(
                        "python", script_path,
                        stdout=asyncio.subprocess.PIPE,
                        stderr=asyncio.subprocess.PIPE,
                        cwd=os.getcwd()
                    )
                    stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=120)
                    stdout_str = stdout.decode(errors='ignore').strip()
                    stderr_str = stderr.decode(errors='ignore').strip()
                    
                    is_success = process.returncode == 0
                    output_text = stdout_str
                    if stderr_str:
                        output_text += f"\n[STDERR]: {stderr_str}"
                    
                    if is_success:
                        # ─── SUCCESS! Emit completion and return ───
                        events.emit_codegen(
                            status="complete",
                            failed_tool=failed_command,
                            error_reason=f"{attempt_label} — Script ran successfully",
                            script=script,
                            output=output_text,
                            success=True,
                        )
                        print(f"DEBUG: [CODEGEN] {attempt_label} — SUCCESS!")
                        return (
                            f"[CODEGEN: Nemotron wrote and executed a Python replacement script]\n"
                            f"Script: {script_path}\n\nOUTPUT:\n{stdout_str}\n"
                            + (f"\nSTDERR:\n{stderr_str}\n" if stderr_str else "")
                        )
                    
                    # ─── FAILED: Script had errors ───
                    print(f"DEBUG: [CODEGEN] {attempt_label} — Script failed (exit code {process.returncode})")
                    
                    if attempt < max_attempts - 1:
                        # Self-heal: send error back to Nemotron to fix
                        events.emit_codegen(
                            status="error",
                            failed_tool=failed_command,
                            error_reason=f"{attempt_label} failed — asking Nemotron to fix...",
                            script=script,
                            output=output_text,
                            success=False,
                        )
                        
                        # Append the assistant's response and the error to the conversation
                        messages.append({"role": "assistant", "content": script})
                        messages.append({"role": "user", "content": (
                            f"The script you wrote has errors. Fix it.\n\n"
                            f"EXIT CODE: {process.returncode}\n"
                            f"STDOUT:\n{stdout_str[:500]}\n"
                            f"STDERR:\n{stderr_str[:500]}\n\n"
                            f"Fix the errors and output ONLY the corrected Python code. No markdown, no explanation."
                        )})
                        continue  # retry
                    else:
                        # Last attempt also failed — return what we have
                        events.emit_codegen(
                            status="error",
                            failed_tool=failed_command,
                            error_reason=f"All {max_attempts} attempts failed",
                            script=script,
                            output=output_text,
                            success=False,
                        )
                        return (
                            f"[CODEGEN: Script failed after {max_attempts} attempts]\n"
                            f"Last output:\n{stdout_str}\nErrors:\n{stderr_str}\n"
                        )
                    
                except asyncio.TimeoutError:
                    events.emit_codegen(
                        status="error",
                        failed_tool=failed_command,
                        error_reason=f"{attempt_label} — Script timed out after 120s",
                        script=script,
                        output="",
                        success=False,
                    )
                    if attempt < max_attempts - 1:
                        messages.append({"role": "assistant", "content": script})
                        messages.append({"role": "user", "content": (
                            "The script timed out after 120 seconds. It must be doing something blocking or too slow. "
                            "Rewrite it to be faster and complete within 60 seconds. Output ONLY Python code."
                        )})
                        continue
                    return f"[CODEGEN] Script timed out after all {max_attempts} attempts."
                    
            except Exception as e:
                print(f"DEBUG: [CODEGEN] {attempt_label} — LLM Error: {e}")
                events.emit_codegen(
                    status="error",
                    failed_tool=failed_command,
                    error_reason=f"{attempt_label} — {str(e)[:200]}",
                    success=False,
                )
                return None
        
        return None

    # ─── IMPROVEMENT #5: Dual-Model Strategic Query ─────────────────────────

    async def _strategic_query(self, context: str) -> str | None:
        """
        Query the strategy model (larger/smarter) for high-level guidance.
        Used when the fast model gets stuck or needs strategic direction.
        """
        if not self._strategy_model or not self._strategy_api_key:
            return None
        
        strategy_prompt = (
            "You are a senior penetration testing strategist. The junior tester is stuck.\n\n"
            "CONTEXT OF THE CURRENT SITUATION:\n"
            f"{context}\n\n"
            "KEY FINDINGS SO FAR:\n"
            + ("\n".join(self._key_findings[-15:]) if self._key_findings else "None yet")
            + "\n\n"
            "Provide a SPECIFIC, ACTIONABLE strategy for the next 3-5 steps. "
            "Include exact commands to run. Be concise."
        )
        
        try:
            print(f"DEBUG: [STRATEGY] Querying {self._strategy_model} for guidance...")
            response = await litellm.acompletion(
                model=self._strategy_model,
                messages=[
                    {"role": "system", "content": "You are a penetration testing strategist. Give specific, actionable advice."},
                    {"role": "user", "content": strategy_prompt}
                ],
                api_key=self._strategy_api_key,
                api_base=self._strategy_api_base,
                num_retries=1
            )
            strategy = response.choices[0].message.content
            print(f"DEBUG: [STRATEGY] Got response: {strategy[:100]}...")
            return strategy
        except Exception as e:
            print(f"DEBUG: [STRATEGY] Error querying strategy model: {e}")
            return None

    # ─── IMPROVEMENT #3: Smart Error Recovery ───────────────────────────────

    def _build_recovery_prompt(self, error_content: str, failed_tool: str = "unknown") -> str:
        """
        Build a structured, OS-aware error recovery prompt
        instead of a generic nudge.
        """
        import platform
        os_name = platform.system()
        
        # Classify the error
        error_lower = error_content.lower()
        
        if "not recognized" in error_lower or "not found" in error_lower or "commandnotfound" in error_lower:
            error_type = "MISSING_TOOL"
            if os_name == "Windows":
                recovery = (
                    f"The tool/command was not found on this Windows system.\n"
                    f"OPTIONS:\n"
                    f"1. Try the Python equivalent: `python -m <module>` or `pip install <tool>`\n"
                    f"2. Use PowerShell alternatives (e.g., Invoke-WebRequest instead of wget)\n"
                    f"3. Use curl.exe (not curl, which is a PowerShell alias)\n"
                    f"4. Try a completely different approach to achieve the same goal\n"
                    f"DO NOT repeat the exact same command."
                )
            else:
                recovery = (
                    f"The tool was not found on this Linux system.\n"
                    f"OPTIONS:\n"
                    f"1. Install via: sudo apt install -y <tool> or pip install <tool>\n"
                    f"2. Use an alternative tool with similar capability\n"
                    f"3. Use curl/wget/python as universal fallbacks\n"
                    f"DO NOT repeat the exact same command."
                )
        elif "permission" in error_lower or "access denied" in error_lower:
            error_type = "PERMISSION"
            recovery = (
                "Permission denied. Try:\n"
                "1. Run with elevated privileges (sudo on Linux)\n"
                "2. Target a different endpoint or use a different technique\n"
                "3. Check if the target is behind authentication"
            )
        elif "timeout" in error_lower or "timed out" in error_lower:
            error_type = "TIMEOUT"
            recovery = (
                "Command timed out. The target may be slow or blocking you. Try:\n"
                "1. Reduce scan intensity (e.g., nmap -T2 instead of -T4)\n"
                "2. Target specific ports instead of full scan\n"
                "3. Check if the target is accessible first with a simple ping/curl\n"
                "4. Use the 'timeout' parameter with a larger value"
            )
        elif "waf" in error_lower or "403" in error_lower or "blocked" in error_lower:
            error_type = "WAF_BLOCK"
            recovery = (
                "The target appears to have WAF/firewall protection. Try:\n"
                "1. Use wafw00f to identify the WAF type\n"
                "2. Reduce scan speed (nmap -T2)\n"
                "3. Add randomized User-Agent headers\n"
                "4. Try different ports or paths\n"
                "5. Use HTTPS instead of HTTP or vice versa"
            )
        elif "connection refused" in error_lower or "connection reset" in error_lower:
            error_type = "CONNECTION"
            recovery = (
                "Connection was refused or reset. The service may be down or filtered. Try:\n"
                "1. Verify the target is reachable with a basic ping\n"
                "2. Try a different port\n"
                "3. Try using a different protocol (HTTP vs HTTPS)\n"
                "4. The service might be rate-limiting you — wait and retry"
            )
        else:
            error_type = "GENERAL"
            recovery = (
                "The command failed. Analyze the error output above carefully and:\n"
                "1. Fix any syntax errors in the command\n"
                "2. Try an alternative approach to achieve the same goal\n"
                "3. Use check_dependencies to verify tool availability\n"
                "4. Consider using Python scripts as a fallback"
            )
        
        return (
            f"RECOVERY [{error_type}] — Tool '{failed_tool}' failed on {os_name}.\n"
            f"Error excerpt: {error_content[:200]}\n\n"
            f"{recovery}\n\n"
            f"CRITICAL: Do NOT give up. Do NOT repeat the same failing command. "
            f"Your mission is incomplete. CONTINUE with a different approach."
        )

    async def connect(self) -> None:
        """Initialize session and system prompt."""
        # Selection happens in controller or on initialization - keys are already set in __init__
        import platform
        from testinggpt.tools.registry import get_registry
        os_name = platform.system()
        registry = get_registry()
        
        # Add a hint for models that might struggle with tool calling format
        # This is especially important for Llama models on Groq/OpenRouter
        env_msg = (
            f"If on Linux/WSL, use standard bash commands. Do NOT assume a Windows environment."
            if os_name != "Windows" else
            f"If on Windows, use PowerShell or CMD syntax. Do NOT assume a Linux/Bash environment."
        )
        
        tool_hint = (
            "\n\n[SYSTEM ENVIRONMENT]\n"
            f"You are running on a **{os_name}** system. "
            f"You MUST use commands and paths compatible with this operating system. {env_msg}\n\n"
            "[TOOL CALLING (CRITICAL - READ CAREFULLY)]\n"
            "You have access to specific Python tools. You MUST use the following XML-style format to call them:\n"
            "<tool_name>arguments</tool_name>\n"
            "- Example: <terminal_execute>nmap -sC allcloths.com</terminal_execute>\n"
            "- Example: <check_dependencies>[\"nmap\", \"sqlmap\"]</check_dependencies>\n"
            "- Example: <read_file>C:\\path\\to\\file.txt</read_file>\n\n"
            "[LONG-RUNNING COMMANDS]\n"
            "- For persistent services (e.g., `python -m http.server`, `proxychains`, `metasploit`), you MUST use the `background=True` argument.\n"
            "- Example: `<terminal_execute background=True>python -m http.server 8000</terminal_execute>`\n"
            "- Standard commands (nmap, curl, etc.) have a 30s timeout unless you specify a longer `timeout` integer.\n\n"
            "IMPORTANT: Do NOT wrap tool calls in markdown blocks (like ```bash). Output them as plain text. This is CRITICAL for automation.\n"
            "IMPORTANT: Ensure you close every tag with a slash like </terminal_execute>.\n"
            "IMPORTANT: The tools listed below are NOT shell commands. You must call them with tags.\n"
            "IMPORTANT: Do NOT use triple backticks anywhere in your response if you are recommending a command.\n"
            "IMPORTANT: You MUST provide at least one tool call in every response until the mission is 100% complete and you have found all flags.\n\n"
            "[AVAILABLE TOOLS]\n"
            f"You have access to: {', '.join(registry.list_tools())}\n"
            "- terminal_execute: Run shell commands (use this for curl, nmap, dir, ls, etc.)\n"
            "- check_dependencies: Internal tool to check if programs are installed (DO NOT run this in terminal_execute)\n"
            "- read_file: Read local files\n"
            "- write_to_file: Create/update local files\n"
            "- list_dir: List directory contents\n\n"
            "[STAGED INTERACTION INSTRUCTION]\n"
            "1. ASSESSMENT: List needed tools and use `<check_dependencies>` to verify availability.\n"
            "2. EXECUTION: Call tools using the <tool_name> format. WAIT for real results.\n\n"
            "[VULNERABILITY REPORTING (IMPORTANT)]\n"
            "You MUST report any findings (even potential ones with 20%+ confidence) as soon as you suspect them.\n"
            "As you gather more evidence, you should report the SAME finding again with an updated (higher or lower) confidence percentage.\n"
            "Format for findings:\n"
            "<finding_found>{\"type\": \"SQL Injection\", \"severity\": \"High\", \"description\": \"Potential injection in login form parameter 'user'\", \"confidence\": 35}</finding_found>\n"
            "Include 'confidence' (integer 0-100) in the finding JSON.\n\n"
            "[STEALTH & EVASION (CRITICAL)]\n"
            "1. ALWAYS check for WAFs using `terminal_execute` with `wafw00f` before aggressive scanning.\n"
            "2. If a WAF is detected, adjust your tools: Use slower speeds in nmap (-T2), add random user-agents, and avoid obvious patterns.\n"
            "3. If a tool fails repeatedly, it might be an IP block. Switch tactics or wait.\n\n"
            "[EXPLOIT MATCHING]\n"
            "When you discover a service version (e.g., Apache 2.4.49), you MUST use `<check_exploits>` to look for known CVEs and exploits before manual testing.\n"
        )
        full_prompt = self._system_prompt + tool_hint
        self._messages = [{"role": "system", "content": full_prompt}]
        self._is_connected = True

    async def disconnect(self) -> None:
        """Clear session."""
        self._messages = []
        self._is_connected = False

    async def query(self, prompt: str) -> None:
        """Store the user query to be processed in receive_messages loop."""
        if not self._is_connected:
            raise RuntimeError("Backend not connected")
        self._messages.append({"role": "user", "content": prompt})
        self._pending_query = prompt

    async def receive_messages(self) -> AsyncIterator[AgentMessage]:
        """
        The main ReAct loop for LiteLLM.
        This handles tool calling and result integration.
        """
        from testinggpt.tools.registry import get_registry

        if not self._is_connected:
            raise RuntimeError("Backend not connected")

        registry = get_registry()
        
        # Define tools for LiteLLM
        available_tools = []
        for tool_name in registry.list_tools():
            tool = registry.get(tool_name)
            if tool:
                available_tools.append({
                    "type": "function",
                    "function": {
                        "name": tool.name,
                        "description": tool.description,
                        "parameters": tool.get_schema()
                    }
                })

            try:
                # Controlled pacing: 2 second delay between thinking/action loops
                await asyncio.sleep(2)
                
                # Perform completion
                # Use the selected key
                # Safely log the key we're trying (first 6 chars)
                current_key = self._api_key
                if isinstance(current_key, str) and len(current_key) > 10:
                    masked_key = f"{current_key[:6]}...{current_key[-4:]}"
                elif isinstance(current_key, list) and current_key:
                    k = current_key[0] if current_key else ""
                    masked_key = f"LIST[{len(current_key)}] first={k[:6]}..." if k else "LIST[empty]"
                else:
                    masked_key = "N/A"
                print(f"DEBUG: [liteLLM] Trying API Key [Index {self._current_key_index}]: {masked_key}")
                print(f"DEBUG: [liteLLM] Model: {self._model}, Messages: {len(self._messages)}")
                
                response = await litellm.acompletion(
                    model=self._model,
                    messages=self._messages,
                    api_key=self._api_key,
                    api_base=self._api_base,
                    num_retries=0 # Handle retries ourselves with rotation
                )
                print(f"DEBUG: [liteLLM] Response received. Finish reason: {getattr(response.choices[0], 'finish_reason', 'unknown')}")
            except (litellm.RateLimitError, litellm.AuthenticationError, litellm.BadRequestError, Exception) as e:
                # Check for specific rotation-triggering errors
                error_str = str(e).lower()
                # Broaden auth error detection to handle variations across providers
                is_auth_error = (
                    isinstance(e, litellm.AuthenticationError) or 
                    "authentication" in error_str or 
                    "invalid api key" in error_str or 
                    "invalid x-api-key" in error_str or
                    "bad_api_key" in error_str or
                    (isinstance(e, litellm.BadRequestError) and ("api key" in error_str or "auth" in error_str))
                )
                is_rate_limit = isinstance(e, litellm.RateLimitError) or "rate limit" in error_str or "429" in error_str
                is_context_error = "too large" in error_str or "context" in error_str or "length" in error_str or "maximum" in error_str
                
                if is_context_error:
                    # Truncate history (keep system prompt + last 5 messages)
                    if len(self._messages) > 6:
                        self._messages = [self._messages[0]] + self._messages[-5:]
                        yield AgentMessage(
                            type=MessageType.TEXT, 
                            content="⚠️ Context window exceeded. Truncating mission history to free up intelligence space... Resuming assessment immediately."
                        )
                        await asyncio.sleep(2)
                        continue
                    else:
                        yield AgentMessage(
                            type=MessageType.ERROR,
                            content=f"Critical Context Error: Message too large even after truncation. Details: {str(e)[:100]}..."
                        )
                        break

                if (is_auth_error or is_rate_limit) and not is_context_error:
                    error_type = "Rate limit" if is_rate_limit else "Auth error"
                    # Mark the key as failed
                    self._key_cooldowns[self._current_key_index] = time.time()
                    
                    if self._rotate_key():
                        yield AgentMessage(
                            type=MessageType.TEXT, 
                            content=f"⚠️ {error_type} for key {self._current_key_index} (Index {self._current_key_index}). Rotating to next available key...\nDetails: {str(e)[:50]}..."
                        )
                        await asyncio.sleep(2)
                        continue
                    else:
                        # All keys are in cooldown
                        wait_remaining = self._COOLDOWN_DURATION
                        yield AgentMessage(
                            type=MessageType.COOLDOWN, 
                            content={"seconds": wait_remaining, "error": str(e)[:100]}
                        )
                        await asyncio.sleep(wait_remaining)
                        continue
                        
                # If we get here and it's a rate limit not handled by rotation (e.g. single key)
                if is_rate_limit:
                    provider = self._model.split('/')[0].capitalize() if '/' in self._model else "LLM"
                    yield AgentMessage(
                        type=MessageType.TEXT, 
                        content=f"Rate limit hit ({provider} 429). Retrying in 30 seconds...\nDetails: {str(e)[:100]}..."
                    )
                    await asyncio.sleep(30)
                    continue
                else:
                    yield AgentMessage(
                        type=MessageType.ERROR,
                        content=f"LLM Error: {str(e)}"
                    )
                    break
            except Exception as e:
                yield AgentMessage(
                    type=MessageType.ERROR,
                    content=f"LLM Error: {str(e)}"
                )
                break

            message = response.choices[0].message
            self._messages.append(message)

            # Handle text content
            if message.content:
                # Extract and process thinking tag
                thought_match = re.search(r"<thinking>(?P<thought>[\s\S]*?)</thinking>", message.content, re.IGNORECASE)
                content_to_show = message.content
                if thought_match:
                    self._current_thought = thought_match.group("thought").strip()
                    # Strip thinking from UI content
                    content_to_show = re.sub(r"<thinking>[\s\S]*?</thinking>", "", content_to_show, flags=re.IGNORECASE).strip()
                
                # Strip ALL potential tool and finding tags from content shown to user to prevent "flashing" XML
                for t_name in registry.list_tools():
                    content_to_show = re.sub(rf"<{t_name}(?:\s+[^>]*)?>[\s\S]*?</{t_name}>", "", content_to_show, flags=re.IGNORECASE)
                    content_to_show = re.sub(rf"<{t_name}(?:\s+[^>]*)?>", "", content_to_show, flags=re.IGNORECASE)
                
                content_to_show = re.sub(r"<(?:finding_found|ask_user|assessment|execution)(?:\s+[^>]*)?>[\s\S]*?</(?:finding_found|ask_user|assessment|execution)>", "", content_to_show, flags=re.IGNORECASE)
                content_to_show = content_to_show.strip()

                if content_to_show:
                    yield AgentMessage(type=MessageType.TEXT, content=content_to_show)
                    # Pacing: 2 second delay after showing an answer
                    await asyncio.sleep(2)

            # Handle tool calls (official API)
            tool_calls_to_process = []
            if message.tool_calls:
                for tc in message.tool_calls:
                    tool_calls_to_process.append({
                        "id": tc.id,
                        "name": tc.function.name,
                        "args": json.loads(tc.function.arguments) if isinstance(tc.function.arguments, str) else tc.function.arguments
                    })
            
            # Fallback: Handle models that return JSON or XML in content
            elif message.content:
                try:
                    # 1. Clean the content - sometimes models wrap things in markdown code blocks
                    content = message.content
                    # Extract from ```json ... ``` or just ``` ... ```
                    # Extract from ```json ... ``` or just ``` ... ``` or any text
                    # We look for <tool_name>... tags even inside backticks if the model fails
                    code_block_matches = re.finditer(r"```(?:[a-zA-Z0-9_-]+)?\s*([\s\S]*?)```", content)
                    blocks_to_check = [content] # Always check full content
                    for match in code_block_matches:
                        blocks_to_check.append(match.group(1))

                    for block in blocks_to_check:
                        # 2. Try XML Extraction (Primary for our prompt)
                        xml_patterns = [
                            r"<function=(?P<name>[^>]+)>(?P<args>[\s\S]*?)</function>",
                        r"<(?:[a-z]+_)?(?P<name2>[a-zA-Z0-9_]+)(?P<attrs2>\s+[^>]*)?>(?P<args2>[\s\S]*?)<\/(?P=name2)>", # Standard XML
                        r"<(?:[a-z]+_)?(?P<name2_2>[a-zA-Z0-9_]+)(?P<attrs2_2>\s+[^>]*)?>(?P<args2_2>[\s\S]*?)<\/(?P=name2_2)>", # Alternate name for backref
                        r"<(?:[a-z]+_)?(?P<name3>[a-zA-Z0-9_]+)(?P<attrs3>\s+[^>]*)?>(?P<args3>[\s\S]*?)<", # Unclosed XML
                            r"(?P<name4>[a-zA-Z0-9_]+):\s*<(?P<args4>[\s\S]*?)>" # tool: <args>
                        ]
                        for pattern in xml_patterns:
                            for xml_match in re.finditer(pattern, block, re.IGNORECASE):
                                gd = xml_match.groupdict()
                                name = (gd.get("name") or gd.get("name2") or gd.get("name3") or gd.get("name4") or "").strip()
                                
                                if not name: continue
                                raw_args = (gd.get("args") or gd.get("args2") or gd.get("args3") or gd.get("args4") or "").strip()
                                raw_attrs = (gd.get("attrs") or gd.get("attrs2") or gd.get("attrs3") or "").strip()
                                
                                # Special handling for terminal execute which often contains complex shell syntax
                                try:
                                    tool_args = json.loads(raw_args)
                                    if not isinstance(tool_args, dict):
                                        tool_args = {"content": tool_args}
                                except:
                                    # Fallback to plain string for command-line tools
                                    if "terminal" in name.lower() or "execute" in name.lower():
                                        tool_args = {"command": raw_args}
                                    else:
                                        tool_args = {"path": raw_args}
                                
                                # Parse attributes like background=True
                                if raw_attrs and isinstance(tool_args, dict):
                                    attr_matches = re.finditer(r"([a-zA-Z0-9_]+)=(?:\"([^\"]*)\"|'([^']*)'|([^ ]+))", raw_attrs)
                                    for am in attr_matches:
                                        k = am.group(1)
                                        v = am.group(2) or am.group(3) or am.group(4)
                                        if v.lower() == "true":
                                            v = True
                                        elif v.lower() == "false":
                                            v = False
                                        elif v.isdigit():
                                            v = int(v)
                                        tool_args[k] = v
                                
                                tool_calls_to_process.append({
                                    "id": f"call_{getattr(response, 'id', 'manual')}_x{len(tool_calls_to_process)}",
                                    "name": name,
                                    "args": tool_args
                                })

                        # 3. Try JSON Extraction (Fallback)
                        if not tool_calls_to_process:
                            for json_match in re.finditer(r"(?:(?P<t_name>[a-zA-Z0-9_]+)\s+)?(?P<json_data>\{[\s\S]*?\})", block):
                                try:
                                    raw_json = json_match.group("json_data")
                                    potential_tool = json.loads(raw_json)
                                    if isinstance(potential_tool, dict):
                                        name = json_match.group("t_name") or potential_tool.get("name") or potential_tool.get("function")
                                        args = potential_tool.get("parameters") or potential_tool.get("arguments") or potential_tool.get("args") or potential_tool
                                        if name and isinstance(name, str):
                                            tool_calls_to_process.append({
                                                "id": f"call_{getattr(response, 'id', 'manual')}_j{len(tool_calls_to_process)}",
                                                "name": name.strip(),
                                                "args": args
                                            })
                                except:
                                    continue
                        
                        # 4. Try Plain Text Command Extraction (Final fallback for stubborn models)
                        # Matches: terminal_execute nmap ... or terminal_execute: nmap ...
                        if not tool_calls_to_process:
                            for line in block.split('\n'):
                                line = line.strip()
                                if not line: continue
                                
                                # Look for tool names at the start of the line
                                for t_name in registry.list_tools():
                                    if line.startswith(f"{t_name} ") or line.startswith(f"{t_name}:"):
                                        args_str = line[len(t_name):].lstrip(": ").strip()
                                        if args_str:
                                            # Avoid false positives if it looks like a sentence
                                            if len(args_str) < 5 and not any(c in args_str for c in "/\\-"):
                                                continue
                                                
                                            tool_calls_to_process.append({
                                                "id": f"call_{getattr(response, 'id', 'manual')}_p{len(tool_calls_to_process)}",
                                                "name": t_name,
                                                "args": {"command": args_str} if "terminal" in t_name else {"path": args_str}
                                            })

                    # Normalize and fix hallucinations for all extracted tools
                    seen_calls = set()
                    normalized_calls = []
                    for tc in tool_calls_to_process:
                        name = tc["name"].lower()
                        # Normalization map
                        norm_map = {
                            "nmap_execute": "terminal_execute",
                            "nmap": "terminal_execute",
                            "run_command": "terminal_execute",
                            "shell": "terminal_execute",
                            "cmd": "terminal_execute",
                            "execute": "terminal_execute",
                            "read": "read_file",
                            "view": "read_file",
                            "cat": "read_file",
                            "write": "write_to_file",
                            "save": "write_to_file",
                            "ls": "list_dir",
                            "list": "list_dir",
                            "dir": "list_dir"
                        }
                        
                        if name in norm_map:
                            tc["name"] = norm_map[name]
                        
                        # Dedup and validate
                        call_sig = f"{tc['name']}:{json.dumps(tc['args'], sort_keys=True)}"
                        if call_sig not in seen_calls:
                            seen_calls.add(call_sig)
                            normalized_calls.append(tc)
                    
                    tool_calls_to_process = normalized_calls
                            
                except Exception as e:
                    import logging
                    logging.getLogger(__name__).error(f"Error extracting tool calls: {e}")

            if tool_calls_to_process:
                for tc in tool_calls_to_process:
                    func_name = tc["name"]
                    func_args = tc["args"]
                    
                    # Ensure func_args is a dict and only contains valid keys for the tool
                    if not isinstance(func_args, dict):
                        func_args = {"command": str(func_args)} if "terminal" in func_name.lower() else {"path": str(func_args)}

                    yield AgentMessage(
                        type=MessageType.TOOL_START,
                        content=None,
                        tool_name=func_name,
                        tool_args=func_args,
                    )

                    # Execute tool
                    tool = registry.get(func_name)
                    if tool:
                        result = await tool.execute(**func_args)
                        
                        # Build a comprehensive response for the AI
                        res_out = str(result.get("result", "")).strip()
                        res_err = str(result.get("error", "")).strip()
                        
                        if result.get("success", False):
                            result_str = res_out if res_out else "Success (No output)"
                        else:
                            # If failed, make sure the AI sees the error
                            result_str = f"STDOUT:\n{res_out}\n\nSTDERR/ERROR:\n{res_err}".strip() if res_out and res_err else (res_err or res_out or "Unknown failure with no output")

                        yield AgentMessage(
                            type=MessageType.TOOL_RESULT,
                            content=result_str,
                            tool_name=func_name,
                            tool_success=result.get("success", False)
                        )

                        # Add result to history (with smart summarization)
                        summarized_result = self._smart_summarize(result_str)
                        self._messages.append({
                            "role": "tool",
                            "tool_call_id": tc["id"],
                            "name": func_name,
                            "content": summarized_result,
                        })
                        
                        # Track consecutive failures for dual-model trigger
                        if not result.get("success", False):
                            self._consecutive_tool_failures += 1
                            print(f"DEBUG: Consecutive failures: {self._consecutive_tool_failures}")
                        else:
                            self._consecutive_tool_failures = 0

                        # Pacing: 2 second delay after tool execution finishes
                        await asyncio.sleep(2)
                
                # ── Code Generator + Strategy: Trigger after repeated failures ──
                if self._consecutive_tool_failures >= 3:
                    # Gather context about what failed
                    last_errors = []
                    last_failed_cmd = "unknown command"
                    for msg in reversed(self._messages[-8:]):
                        if msg.get("role") == "tool" and msg.get("content"):
                            content = msg["content"][:300]
                            last_errors.append(content)
                            # Extract the failed command from tool args if available
                            if "not recognized" in content.lower() or "not found" in content.lower():
                                # Try to extract tool name from error
                                for word in content.split():
                                    if word.startswith("'") and word.endswith("'"):
                                        last_failed_cmd = word.strip("'")
                                        break
                    
                    error_summary = "\n---\n".join(last_errors[:3])
                    
                    # FIRST: Try code generation (Nemotron writes a Python script)
                    if self._codegen_model:
                        yield AgentMessage(
                            type=MessageType.TEXT,
                            content=f"Tool failed {self._consecutive_tool_failures}x. Generating Python replacement script..."
                        )
                        
                        codegen_result = await self._code_generate(
                            failed_command=last_failed_cmd,
                            error_output=error_summary,
                            goal=f"The pentesting agent is trying to scan a target but the tool '{last_failed_cmd}' is not available."
                        )
                        
                        if codegen_result:
                            self._messages.append({
                                "role": "system",
                                "content": f"[CODE GENERATOR — Nemotron 120B]\n{codegen_result}\n\nUse the output above to continue your analysis. Do NOT re-run the failed tool."
                            })
                            yield AgentMessage(
                                type=MessageType.TEXT,
                                content=f"Code generator produced a replacement script. Results injected."
                            )
                            self._consecutive_tool_failures = 0
                    
                    # FALLBACK: Strategy query if codegen not available or didn't help
                    elif self._strategy_model:
                        error_context = (
                            f"Target: scanning in progress\n"
                            f"Model: {self._model}\n"
                            f"Last {self._consecutive_tool_failures} tool calls FAILED.\n"
                            f"Recent errors:\n{error_summary}"
                        )
                        
                        strategy = await self._strategic_query(error_context)
                        if strategy:
                            self._messages.append({
                                "role": "system",
                                "content": f"[STRATEGIC ADVISOR — {self._strategy_model}]\n{strategy}"
                            })
                            yield AgentMessage(
                                type=MessageType.TEXT,
                                content=f"Consulting strategy model for guidance..."
                            )
                            self._consecutive_tool_failures = 0
                
                # Continue loop to let LLM process results
                continue
            
            # ── Smart Error Recovery: check if last tool failed ──
            last_was_error = False
            last_error_content = ""
            last_error_tool = "unknown"
            if self._messages and self._messages[-1].get("role") == "tool":
                content = str(self._messages[-1].get("content", ""))
                tool_name = self._messages[-1].get("name", "unknown")
                if "failed with code" in content or "error" in content.lower() or "not recognized" in content or "diagnostic" in content.lower():
                    last_was_error = True
                    last_error_content = content
                    last_error_tool = tool_name

            if last_was_error:
                print(f"AGENT_DEBUG: Tool '{last_error_tool}' failed. Injecting smart recovery...")
                recovery_prompt = self._build_recovery_prompt(last_error_content, last_error_tool)
                self._messages.append({
                    "role": "system",
                    "content": recovery_prompt
                })
                continue

            # For now, we'll yield a result which finishes the turn
            print(f"AGENT_DEBUG: Turn finished with no tools. Finish reason: {getattr(response.choices[0], 'finish_reason', 'unknown')}")
            yield AgentMessage(
                type=MessageType.RESULT,
                content="Turn complete. No further actions recommended.",
                metadata={"cost_usd": 0}
            )
            break

    @property
    def session_id(self) -> str | None:
        return self._session_id

    async def resume(self, session_id: str) -> bool:
        # TBD: Persistence for LiteLLM sessions
        self._session_id = session_id
        return True
