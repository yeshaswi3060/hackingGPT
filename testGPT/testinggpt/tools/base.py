"""Base classes for extensible tool framework."""

from abc import ABC, abstractmethod
from typing import Any


class BaseTool(ABC):
    """Base class for all tools in testinggpt."""

    def __init__(self, name: str, description: str) -> None:
        """
        Initialize a tool.

        Args:
            name: Tool name (e.g., "terminal_execute")
            description: Human-readable description
        """
        self.name = name
        self.description = description

    @abstractmethod
    def get_schema(self) -> dict[str, Any]:
        """
        Get the JSON schema for this tool's parameters.
        Returns OpenAI-compatible function schema.
        """
        pass

    def to_dict(self) -> dict[str, Any]:
        """Convert tool execution info to dictionary for tracer."""
        return {
            "tool_name": self.name,
            "description": self.description,
        }

    @abstractmethod
    async def execute(self, *args: Any, **kwargs: Any) -> dict[str, Any]:
        """
        Execute the tool with given arguments.

        Returns:
            Dictionary with execution results including:
            - success: bool
            - result: Any
            - error: Optional[str]
        """
        pass


