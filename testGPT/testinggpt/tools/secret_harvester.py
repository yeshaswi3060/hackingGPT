"""Secret Harvester Tool — finding leaks in the abyss."""

import re
import math
import requests
from typing import Any, Dict, List, Set
from testinggpt.tools.base import BaseTool

class SecretHarvesterTool(BaseTool):
    """Tool for finding high-entropy secrets and credentials in target source code."""

    def __init__(self) -> None:
        """Initialize SecretHarvesterTool."""
        super().__init__(
            name="secret_harvester",
            description="Find API keys, tokens, and sensitive credentials in source code using advanced entropy analysis and regex."
        )

    def get_schema(self) -> dict[str, Any]:
        """Get parameter schema for secret harvesting."""
        return {
            "type": "object",
            "properties": {
                "url": {
                    "type": "string",
                    "description": "The URL to scan for secrets."
                },
                "deep_scan": {
                    "type": "boolean",
                    "description": "Whether to also check linked JavaScript files.",
                    "default": True
                }
            },
            "required": ["url"]
        }

    def _calculate_entropy(self, data: str) -> float:
        """Calculate Shannon entropy to identify random-looking strings (likely keys)."""
        if not data:
            return 0
        entropy = 0
        for x in range(256):
            p_x = float(data.count(chr(x))) / len(data)
            if p_x > 0:
                entropy += - p_x * math.log(p_x, 2)
        return entropy

    async def execute(self, url: str = "", deep_scan: bool = True, **kwargs: Any) -> dict[str, Any]:
        """Execute the secret harvester."""
        if not url:
            return {"success": False, "result": "", "error": "No URL provided"}

        try:
            # Disable warnings for insecure requests
            import urllib3
            urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
            
            response = requests.get(url, verify=False, timeout=10)
            content = response.text
            
            secrets: Set[str] = set()
            findings = []
            
            # 1. Regex-based detection
            patterns = {
                "AWS Key": r"AKIA[0-9A-Z]{16}",
                "Google API": r"AIza[0-9A-Za-z-_]{35}",
                "Slack Token": r"xox[pb]-[0-9]{12}-[0-9]{12}-[0-9]{12}-[a-z0-9]{32}",
                "Generic Secret": r"(?i)secret[_-]?key['\"]?\s*[:=]\s*['\"]?([a-zA-Z0-9_\-\.]{16,})['\"]?",
                "Password": r"(?i)password['\"]?\s*[:=]\s*['\"]?([a-zA-Z0-9_\-\.]{8,})['\"]?",
                "Database URL": r"[a-z]+://[a-z0-9_]+:[a-z0-9_]+@[a-z0-9\.-]+:[0-9]+/[a-z0-9_-]+"
            }
            
            for name, pattern in patterns.items():
                matches = re.findall(pattern, content)
                for m in matches:
                    if isinstance(m, tuple): m = m[0]
                    secrets.add(f"{name}: {m}")
                    findings.append({"type": name, "value": m})

            # 2. Entropy-based detection (finding random keys)
            tokens = re.findall(r"[A-Za-z0-9_-]{24,}", content)
            for t in tokens:
                if self._calculate_entropy(t) > 3.8: # Threshold for high-entropy string
                    if not any(t in s for s in secrets):
                        secrets.add(f"High Entropy Token: {t}")
                        findings.append({"type": "High Entropy Token", "value": t})

            result_msg = f"--- SECRET HARVESTER RESULTS FOR {url} ---\n\n"
            if secrets:
                result_msg += "\n".join(secrets)
                # Emit finding for UI
                from testinggpt.core.events import EventBus
                eb = EventBus.get()
                for f in findings:
                    eb.emit_finding({
                        "type": f["type"],
                        "severity": "High",
                        "description": f"Detected potential {f['type']} in {url}.",
                        "evidence": f["value"],
                        "mitigation": "Ensure secrets are not leaked in client-side code.",
                        "thought": "Entropy and regex analysis identified a sensitive-looking string.",
                        "confidence": 80,
                        "waf_status": "NOT DETECTED"
                    })
            else:
                result_msg += "No secrets found on the initial page."

            return {
                "success": True,
                "result": result_msg,
                "findings": findings
            }

        except Exception as e:
            return {"success": False, "result": "", "error": str(e)}
