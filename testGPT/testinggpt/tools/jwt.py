"""JWT Analyzer Tool — expert-level token analysis."""

import base64
import json
import re
from typing import Any, Dict, Optional
from testinggpt.tools.base import BaseTool
from testinggpt.core.events import EventBus

class JWTAnalyzerTool(BaseTool):
    """Tool for decoding, analyzing, and attacking JSON Web Tokens."""

    def __init__(self) -> None:
        """Initialize JWTAnalyzerTool."""
        super().__init__(
            name="jwt_analyzer",
            description="Analyze a JWT token for vulnerabilities like 'alg:none', predictable secrets, or sensitive claims."
        )

    def get_schema(self) -> dict[str, Any]:
        """Get parameter schema for JWT analysis."""
        return {
            "type": "object",
            "properties": {
                "token": {
                    "type": "string",
                    "description": "The full JWT token string to analyze."
                },
                "attempt_bypass": {
                    "type": "boolean",
                    "description": "Whether to generate a bypassed token (e.g., alg:none)",
                    "default": False
                }
            },
            "required": ["token"]
        }

    def _decode_part(self, part: str) -> dict:
        """Decode a Base64URL part of a JWT."""
        try:
            # Fix padding
            padding = '=' * (4 - len(part) % 4)
            decoded = base64.urlsafe_b64decode(part + padding).decode('utf-8')
            return json.loads(decoded)
        except Exception:
            return {}

    async def execute(self, token: str = "", attempt_bypass: bool = False, **kwargs: Any) -> dict[str, Any]:
        """Execute the JWT analysis."""
        if not token:
            return {"success": False, "result": "", "error": "No token provided"}

        parts = token.split('.')
        if len(parts) != 3:
            return {"success": False, "result": "", "error": "Invalid JWT format (must have 3 parts)"}

        header = self._decode_part(parts[0])
        payload = self._decode_part(parts[1])
        
        results = []
        vulnerabilities = []

        results.append(f"--- JWT DECODE ---\nHeader: {json.dumps(header)}\nPayload: {json.dumps(payload)}\n")

        # 1. Check Algorithm
        alg = header.get("alg", "").upper()
        if alg == "NONE":
            vulnerabilities.append("CRITICAL: 'alg: none' is enabled in the header.")
        elif alg == "HS256":
            results.append("INFO: Token uses HS256 (Symmetric secret). Vulnerable to brute-force.")
        
        # 2. Check Expiration
        import time
        exp = payload.get("exp")
        if exp and exp < time.time():
            results.append("WARNING: Token is EXPIRED.")

        # 3. Check Sensitive Claims
        sensitive_keys = ["admin", "role", "privilege", "internal", "secret", "user_id"]
        for key in sensitive_keys:
            if key in payload:
                results.append(f"INSIGHT: Found sensitive claim '{key}': {payload[key]}")

        # 4. Generate Bypass if requested
        bypass_token = None
        if attempt_bypass:
            new_header = header.copy()
            new_header["alg"] = "none"
            h_b64 = base64.urlsafe_b64encode(json.dumps(new_header).encode()).decode().strip("=")
            p_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().strip("=")
            bypass_token = f"{h_b64}.{p_b64}."
            results.append(f"\n--- BYPASS ATTEMPT (alg:none) ---\nToken: {bypass_token}")

        if vulnerabilities:
            from testinggpt.core.events import EventBus
            events = EventBus.get()
            events.emit_finding({
                "type": "JWT Vulnerability",
                "severity": "Critical",
                "description": f"JWT token analyzed and found to be vulnerable: {', '.join(vulnerabilities)}",
                "evidence": f"Token part 0: {parts[0]}",
                "mitigation": "Enforce strong asymmetric algorithms (e.g., RS256) and strictly reject 'alg:none' tokens in the backend code.",
                "thought": "The JWT header explicitly allows the 'none' algorithm, which bypasses all cryptographic signature checks.",
                "exploit_details": f"An attacker can simply modify the payload (e.g., setting 'admin': true) and the server will accept the token if the header is set to 'alg': 'none'.",
                "confidence": 100,
                "waf_status": "NOT DETECTED"
            })

        summary = "\n".join(results)
        return {
            "success": True,
            "result": f"JWT Analysis Complete:\n\n{summary}",
            "vulnerabilities": vulnerabilities,
            "bypass_token": bypass_token
        }
