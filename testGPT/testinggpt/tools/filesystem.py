"""Filesystem manipulation tools for testinggpt."""

import os
from pathlib import Path
from typing import Any

from testinggpt.tools.base import BaseTool


class FileReadTool(BaseTool):
    """Tool for reading file contents."""

    def __init__(self) -> None:
        """Initialize tool."""
        super().__init__(
            name="read_file",
            description="Read the contents of a file from the local filesystem."
        )

    def get_schema(self) -> dict[str, Any]:
        """Get parameter schema for file reading."""
        return {
            "type": "object",
            "properties": {
                "path": {
                    "type": "string", 
                    "description": "Path to the file to read"
                }
            },
            "required": ["path"]
        }

    async def execute(self, path: str = "", **kwargs: Any) -> dict[str, Any]:
        """Execute tool."""
        if not path:
            return {"success": False, "result": "", "error": "No path provided"}

        try:
            file_path = Path(path)
            if not file_path.exists():
                return {"success": False, "result": "", "error": f"File {path} does not exist"}

            content = file_path.read_text()
            return {"success": True, "result": content, "error": None}

        except Exception as e:
            return {"success": False, "result": "", "error": str(e)}


class FileWriteTool(BaseTool):
    """Tool for writing file contents."""

    def __init__(self) -> None:
        """Initialize tool."""
        super().__init__(
            name="write_to_file",
            description="Write content to a file on the local filesystem."
        )

    def get_schema(self) -> dict[str, Any]:
        """Get parameter schema for file writing."""
        return {
            "type": "object",
            "properties": {
                "path": {
                    "type": "string", 
                    "description": "Path to the file to write to"
                },
                "content": {
                    "type": "string",
                    "description": "Content to write into the file"
                }
            },
            "required": ["path", "content"]
        }

    async def execute(self, path: str = "", content: str = "", **kwargs: Any) -> dict[str, Any]:
        """Execute tool."""
        if not path:
            return {"success": False, "result": "", "error": "No path provided"}

        try:
            file_path = Path(path)
            # Create parent directories if they don't exist
            file_path.parent.mkdir(parents=True, exist_ok=True)
            file_path.write_text(content)
            return {"success": True, "result": f"Successfully wrote to {path}", "error": None}

        except Exception as e:
            return {"success": False, "result": "", "error": str(e)}


class ListDirTool(BaseTool):
    """Tool for listing directory contents."""

    def __init__(self) -> None:
        """Initialize tool."""
        super().__init__(
            name="list_dir",
            description="List the contents of a directory on the local filesystem."
        )

    def get_schema(self) -> dict[str, Any]:
        """Get parameter schema for directory listing."""
        return {
            "type": "object",
            "properties": {
                "path": {
                    "type": "string", 
                    "description": "Path to the directory to list (default is '.')"
                }
            }
        }

    async def execute(self, path: str = ".", **kwargs: Any) -> dict[str, Any]:
        """Execute tool."""
        try:
            dir_path = Path(path)
            if not dir_path.exists():
                return {"success": False, "result": "", "error": f"Directory {path} does not exist"}

            contents = [str(p.name) + ("/" if p.is_dir() else "") for p in dir_path.iterdir()]
            return {"success": True, "result": "\n".join(contents), "error": None}

        except Exception as e:
            return {"success": False, "result": "", "error": str(e)}
