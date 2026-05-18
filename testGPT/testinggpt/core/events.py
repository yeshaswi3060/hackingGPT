"""INTERACTIVE FEEDBACK (CRITICAL):
If you reach a point where you cannot proceed without specific information from the human (e.g., a target IP, credentials, clarification on scope), you MUST use the `<ask_user>` tag.
- Format: `<ask_user>Your question here</ask_user>`
- Use this ONLY when you are genuinely stuck or need specific data to continue the attack.
- When you use this tag, the system will pause and wait for the human to reply.
- Do NOT provide a generic "Mission complete" message if you are waiting for a user response.

Stay focused on finding and extracting flags efficiently.
Be thorough in enumeration, creative in exploitation, and RELENTLESSLY persistent in flag hunting.
"""

import contextlib
import threading
from collections.abc import Callable
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum, auto
from typing import Any, Optional


class EventType(Enum):
    """Event types for agent-TUI communication."""

    # Agent -> UI events (4 essential)
    STATE_CHANGED = auto()  # idle, running, paused, completed, error
    MESSAGE = auto()  # text output from agent
    TOOL = auto()  # tool start/complete
    FLAG_FOUND = auto()  # flag detected
    FINDING_FOUND = auto()  # vulnerability/finding detected
    COOLDOWN_START = auto()  # rate limit cooldown started
    INPUT_REQUIRED = auto()  # AI is waiting for user input
    GRAPH_UPDATE = auto()  # Attack graph data update (nodes/links)
    SKIP_TOOL = auto()  # User requested to skip/terminate the current tool
    CODEGEN = auto()  # Code generator wrote and executed a script

    # UI -> Agent events (2 essential)
    USER_COMMAND = auto()  # pause, resume, stop
    USER_INPUT = auto()  # instruction text


@dataclass
class Event:
    """Event container with type and data."""

    type: EventType
    data: dict[str, Any] = field(default_factory=dict)
    metadata: dict[str, Any] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.now)


class EventBus:
    """Minimal thread-safe event bus for pub/sub communication."""

    _instance: Optional["EventBus"] = None
    _lock = threading.Lock()

    def __init__(self) -> None:
        """Initialize event bus."""
        self._handlers: dict[EventType, list[Callable[[Event], None]]] = {}
        self._handler_lock = threading.Lock()

    @classmethod
    def get(cls) -> "EventBus":
        """Get singleton EventBus instance."""
        with cls._lock:
            if cls._instance is None:
                cls._instance = cls()
            return cls._instance

    @classmethod
    def reset(cls) -> None:
        """Reset singleton instance (useful for testing)."""
        with cls._lock:
            cls._instance = None

    def subscribe(self, event_type: EventType, handler: Callable[[Event], None]) -> None:
        """Subscribe a handler to an event type.

        Args:
            event_type: Type of event to subscribe to
            handler: Callback function to invoke on event
        """
        with self._handler_lock:
            if event_type not in self._handlers:
                self._handlers[event_type] = []
            if handler not in self._handlers[event_type]:
                self._handlers[event_type].append(handler)

    def unsubscribe(self, event_type: EventType, handler: Callable[[Event], None]) -> None:
        """Unsubscribe a handler from an event type.

        Args:
            event_type: Type of event to unsubscribe from
            handler: Handler to remove
        """
        with self._handler_lock:
            if event_type in self._handlers:
                with contextlib.suppress(ValueError):
                    self._handlers[event_type].remove(handler)

    def emit(self, event: Event) -> None:
        """Emit an event to all subscribers.

        Args:
            event: Event to emit
        """
        with self._handler_lock:
            handlers = self._handlers.get(event.type, []).copy()

        for handler in handlers:
            # Don't let one handler break others
            with contextlib.suppress(Exception):
                handler(event)

    # Convenience methods for common events

    def emit_state(
        self,
        state: str,
        details: str = "",
        target: str | None = None,
        task: str | None = None,
        last_tool_success: bool = True,
        failed_tool_name: str | None = None,
    ) -> None:
        """Emit a state change event.

        Args:
            state: New state (idle, running, paused, completed, error)
            details: Optional details about the state
            target: Optional target IP/URL for session tracking (used by Langfuse)
            task: Optional full task description for session tracking (used by Langfuse)
            last_tool_success: Whether the last tool execution was successful
            failed_tool_name: Name of the failing tool if success is False
        """
        data: dict[str, Any] = {
            "state": state, 
            "details": details,
            "last_tool_success": last_tool_success,
            "failed_tool_name": failed_tool_name
        }
        if target is not None:
            data["target"] = target
        if task is not None:
            data["task"] = task
        self.emit(Event(EventType.STATE_CHANGED, data))

    def emit_message(self, text: str, msg_type: str = "info", metadata: dict[str, Any] | None = None) -> None:
        """Emit a message event.

        Args:
            text: Message text
            msg_type: Message type (info, success, error, warning)
            metadata: Optional metadata (e.g., cost)
        """
        self.emit(Event(EventType.MESSAGE, {"text": text, "type": msg_type}, metadata=metadata or {}))

    def emit_tool(
        self,
        status: str,
        name: str,
        args: dict[str, Any] | None = None,
        result: Any | None = None,
    ) -> None:
        """Emit a tool event.

        Args:
            status: Tool status (start, complete, error)
            name: Tool name
            args: Tool arguments
            result: Tool result (for complete status)
        """
        self.emit(
            Event(
                EventType.TOOL,
                {"status": status, "name": name, "args": args or {}, "result": result},
            )
        )

    def emit_flag(self, flag: str, context: str = "") -> None:
        """Emit a flag found event.

        Args:
            flag: The flag string
            context: Context where flag was found
        """
        self.emit(Event(EventType.FLAG_FOUND, {"flag": flag, "context": context}))

    def emit_finding(self, finding: dict[str, str]) -> None:
        """Emit a finding found event.

        Args:
            finding: Dictionary with type, severity, and description
        """
        self.emit(Event(EventType.FINDING_FOUND, {"finding": finding}))

    def emit_command(self, command: str) -> None:
        """Emit a user command event.

        Args:
            command: Command (pause, resume, stop)
        """
        self.emit(Event(EventType.USER_COMMAND, {"command": command}))

    def emit_input(self, text: str) -> None:
        """Emit a user input event.

        Args:
            text: User input text
        """
        self.emit(Event(EventType.USER_INPUT, {"text": text}))

    def emit_skip_tool(self) -> None:
        """Emit a skip tool event."""
        self.emit(Event(EventType.SKIP_TOOL))

    def emit_input_required(self, text: str) -> None:
        """Emit an input required event.
        
        Args:
            text: Question or message from the AI
        """
        self.emit(Event(EventType.INPUT_REQUIRED, {"text": text}))

    def emit_graph_update(self, nodes: list[dict[str, Any]], links: list[dict[str, Any]]) -> None:
        """Emit an attack graph update event.
        
        Args:
            nodes: List of graph nodes {id, label, type, ...}
            links: List of graph links {source, target, type, ...}
        """
        self.emit(Event(EventType.GRAPH_UPDATE, {"nodes": nodes, "links": links}))

    def emit_cooldown(self, seconds: int, error: str = "") -> None:
        """Emit a rate limit cooldown event.

        Args:
            seconds: Cooldown duration in seconds
            error: Error message
        """
        self.emit(Event(EventType.COOLDOWN_START, {"seconds": seconds, "error": error}))

    def emit_codegen(
        self,
        status: str,
        failed_tool: str = "",
        error_reason: str = "",
        script: str = "",
        output: str = "",
        success: bool = False,
    ) -> None:
        """Emit a code generation event.

        Args:
            status: Phase (generating, executing, complete, error)
            failed_tool: The tool that failed, triggering codegen
            error_reason: Why the tool failed
            script: The generated Python script
            output: Script execution output
            success: Whether script ran successfully
        """
        self.emit(Event(EventType.CODEGEN, {
            "status": status,
            "failed_tool": failed_tool,
            "error_reason": error_reason,
            "script": script,
            "output": output,
            "success": success,
        }))
