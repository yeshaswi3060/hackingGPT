"""Dependency check tool for testinggpt."""

import shutil
from typing import Any

from testinggpt.tools.base import BaseTool


class DependencyCheckTool(BaseTool):
    """Tool for checking if required programs are installed."""

    def __init__(self) -> None:
        """Initialize dependency check tool."""
        super().__init__(
            name="check_dependencies",
            description="Check if one or more terminal commands/programs are installed on the system."
        )

    def get_schema(self) -> dict[str, Any]:
        """Get parameter schema for dependency check."""
        return {
            "type": "object",
            "properties": {
                "commands": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    },
                    "description": "List of commands to check for existence (e.g., ['nmap', 'sqlmap', 'python'])"
                }
            },
            "required": ["commands"]
        }

    async def execute(self, commands: list[str] | str | None = None, **kwargs: Any) -> dict[str, Any]:
        """
        Check if commands are available.

        Args:
            commands: List of commands or single command string.
            **kwargs: Additional arguments (handles 'command', 'path', etc.)

        Returns:
            Dictionary with results for each command.
        """
        # Robust argument extraction
        raw_commands = commands or kwargs.get("commands") or kwargs.get("content") or kwargs.get("command") or kwargs.get("path")
        
        if not raw_commands:
            return {"success": False, "result": "", "error": "No commands provided"}

        if isinstance(raw_commands, str):
            # Handle space-separated commands or comma-separated
            if "," in raw_commands:
                commands_list = [c.strip() for c in raw_commands.split(",") if c.strip()]
            else:
                commands_list = [c.strip() for c in raw_commands.split() if c.strip()]
        else:
            commands_list = raw_commands

        results = {}
        missing = []
        
        for cmd_with_args in commands_list:
            # Strip flags (e.g., "nmap -sV" -> "nmap")
            cmd = cmd_with_args.split()[0] if cmd_with_args else ""
            if not cmd: continue
            
            path = shutil.which(cmd)
            results[cmd] = {
                "installed": path is not None,
                "path": path or "Not found"
            }
            if not path:
                missing.append(cmd)

        message = "All checked dependencies are present."
        if missing:
            message = f"Missing dependencies: {', '.join(missing)}"

        return {
            "success": len(missing) == 0,
            "result": message,
            "details": results,
            "error": None if len(missing) == 0 else "Some dependencies are missing"
        }
