"""Code Generation & Execution Tool — the 'Do It Anyway' engine."""

import os
import subprocess
import tempfile
from typing import Any, Dict, Optional
from testinggpt.tools.base import BaseTool
from testinggpt.core.events import EventBus

class PythonGeneratorTool(BaseTool):
    """Tool for executing bespoke Python scripts generated to bypass obstacles."""

    def __init__(self) -> None:
        """Initialize PythonGeneratorTool."""
        super().__init__(
            name="python_generator",
            description="Execute a bespoke Python script to solve a specific problem or bypass a tool failure. Use this to 'do it anyway' when standard tools fail."
        )

    def get_schema(self) -> dict[str, Any]:
        """Get parameter schema for code execution."""
        return {
            "type": "object",
            "properties": {
                "script_code": {
                    "type": "string",
                    "description": "The complete, standalone Python code to execute."
                },
                "objective": {
                    "type": "string",
                    "description": "The goal this script is trying to achieve (e.g., 'Bypass WAF for SQLi')"
                },
                "timeout": {
                    "type": "integer",
                    "description": "Max seconds to run the script (default 60)",
                    "default": 60
                }
            },
            "required": ["script_code", "objective"]
        }

    async def execute(self, script_code: str = "", objective: str = "", timeout: int = 60, **kwargs: Any) -> dict[str, Any]:
        """Execute the generated Python script."""
        if not script_code:
            return {"success": False, "result": "", "error": "No script code provided"}

        events = EventBus.get()
        events.emit_message(f"🛠️ [SELF-HEAL] Executing bespoke script for objective: {objective}...", "info")

        # Create a temporary file for the script
        with tempfile.NamedTemporaryFile(suffix=".py", delete=False, mode='w', encoding='utf-8') as f:
            f.write(script_code)
            temp_path = f.name

        try:
            # Execute the script
            # Note: Using subprocess.run for simplicity in this specific tool
            # To avoid blocking the event loop too long, we use a small timeout
            # In a production agent, we'd use asyncio.create_subprocess_exec
            process = subprocess.run(
                ["python", temp_path],
                capture_output=True,
                text=True,
                timeout=timeout,
                cwd=os.getcwd()
            )
            
            stdout = process.stdout.strip()
            stderr = process.stderr.strip()
            success = process.returncode == 0

            result_msg = (
                f"--- BESPOKE SCRIPT OUTPUT ---\n"
                f"Objective: {objective}\n"
                f"Exit Code: {process.returncode}\n\n"
                f"STDOUT:\n{stdout[:5000]}\n\n"
                f"STDERR:\n{stderr[:2000]}"
            )

            if success:
                events.emit_message(f"✅ [SELF-HEAL] Script succeeded in objective: {objective}", "success")
            else:
                events.emit_message(f"❌ [SELF-HEAL] Script failed for objective: {objective}", "error")

            return {
                "success": success,
                "result": result_msg,
                "error": stderr if not success else None,
                "exit_code": process.returncode
            }

        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "result": "Script timed out.",
                "error": f"Execution exceeded {timeout}s"
            }
        except Exception as e:
            return {
                "success": False,
                "result": "",
                "error": f"Execution error: {str(e)}"
            }
        finally:
            if os.path.exists(temp_path):
                try: os.remove(temp_path)
                except: pass
