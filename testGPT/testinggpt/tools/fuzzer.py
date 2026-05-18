"""Fuzzer Tool — uncovering hidden paths."""

import requests
import asyncio
from typing import Any, Dict, List
from testinggpt.tools.base import BaseTool

class FuzzerTool(BaseTool):
    """Tool for fuzzing directories and files to find hidden endpoints."""

    def __init__(self) -> None:
        """Initialize FuzzerTool."""
        super().__init__(
            name="fuzzer",
            description="Fuzz a URL for common files and directories (e.g., .php, .bak, .env, /admin)."
        )

    def get_schema(self) -> dict[str, Any]:
        """Get parameter schema for fuzzing."""
        return {
            "type": "object",
            "properties": {
                "base_url": {
                    "type": "string",
                    "description": "The base URL to fuzz."
                },
                "extensions": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of file extensions to check (e.g., ['.php', '.bak']).",
                    "default": [".php", ".php.bak", ".env", ".git", ".zip", ".old", "~"]
                }
            },
            "required": ["base_url"]
        }

    async def _check_path(self, session: requests.Session, url: str) -> str | None:
        """Check if a path exists."""
        try:
            # Using HEAD to be efficient
            response = session.head(url, verify=False, timeout=3, allow_redirects=False)
            if response.status_code in [200, 301, 302, 403]:
                return f"{url} (Status: {response.status_code})"
        except:
            pass
        return None

    async def execute(self, base_url: str = "", extensions: List[str] = None, **kwargs: Any) -> dict[str, Any]:
        """Execute the fuzzer."""
        if not base_url:
            return {"success": False, "result": "", "error": "No base URL provided"}

        if not base_url.endswith("/"):
            base_url += "/"

        if not extensions:
            extensions = [".php", ".php.bak", ".env", ".git", ".zip", ".old", "~"]

        # Common wordlist (Small but effective)
        wordlist = [
            "index", "admin", "login", "config", "db", "database", "api", "v1", "v2", 
            "upload", "uploads", "backup", "bak", "old", "test", "dev", "prod", 
            "wp-config", "wp-login", "user", "users", "auth", "sso", "gate", 
            "shell", "cmd", "info", "phpinfo", "setup", "install", "README", "LICENSE",
            ".env", ".git", ".htaccess", "docker-compose.yml"
        ]

        found_paths = []
        
        # Disable warnings
        import urllib3
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        
        session = requests.Session()
        
        # Check base paths and extensions
        tasks = []
        for word in wordlist:
            # Check directory/base file
            tasks.append(self._check_path(session, f"{base_url}{word}"))
            # Check with extensions
            for ext in extensions:
                tasks.append(self._check_path(session, f"{base_url}{word}{ext}"))

        # Limit concurrency but run fast
        results = await asyncio.gather(*tasks)
        found_paths = [r for r in results if r]

        result_msg = f"--- FUZZER RESULTS FOR {base_url} ---\n\n"
        if found_paths:
            result_msg += "\n".join(found_paths)
            # Emit finding for UI
            from testinggpt.core.events import EventBus
            eb = EventBus.get()
            for p in found_paths:
                eb.emit_finding({
                    "type": "HIDDEN PATH DISCOVERED",
                    "severity": "Medium",
                    "description": f"Potential hidden file or directory found: {p}",
                    "evidence": p,
                    "confidence": 90,
                    "waf_status": "BYPASSED"
                })
        else:
            result_msg += "No hidden paths found with current wordlist."

        return {
            "success": True,
            "result": result_msg,
            "found_paths": found_paths
        }
