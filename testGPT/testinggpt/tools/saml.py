"""SAML Analyzer Tool — the bridge to SSO bypass."""

import zlib
import base64
import urllib.parse
from typing import Any, Dict, Optional
from testinggpt.tools.base import BaseTool

class SAMLAnalyzerTool(BaseTool):
    """Tool for analyzing and decoding SAML requests/responses."""

    def __init__(self) -> None:
        """Initialize SAMLAnalyzerTool."""
        super().__init__(
            name="saml_analyzer",
            description="Decode, analyze, and suggest attacks for SAML requests and responses (XML-based SSO)."
        )

    def get_schema(self) -> dict[str, Any]:
        """Get parameter schema."""
        return {
            "type": "object",
            "properties": {
                "saml_data": {
                    "type": "string",
                    "description": "The Base64 and/or Deflated SAML request/response string."
                },
                "is_request": {
                    "type": "boolean",
                    "description": "Whether the data is a SAMLRequest (True) or SAMLResponse (False).",
                    "default": True
                }
            },
            "required": ["saml_data"]
        }

    def _decode_saml(self, data: str, is_request: bool) -> str:
        """Decode SAML data based on common encodings."""
        try:
            # Step 1: URL Decode
            decoded = urllib.parse.unquote(data)
            # Step 2: Base64 Decode
            b64_decoded = base64.b64decode(decoded)
            
            if is_request:
                # Step 3: Inflate (if request)
                try:
                    return zlib.decompress(b64_decoded, -15).decode('utf-8')
                except:
                    return b64_decoded.decode('utf-8')
            else:
                return b64_decoded.decode('utf-8')
        except Exception as e:
            return f"Error decoding: {str(e)}"

    async def execute(self, saml_data: str, is_request: bool = True, **kwargs: Any) -> dict[str, Any]:
        if not saml_data:
            return {"success": False, "result": "No SAML data provided."}

        decoded_xml = self._decode_saml(saml_data, is_request)
        
        analysis = [
            "--- SAML ANALYSIS ---",
            f"Type: {'SAMLRequest' if is_request else 'SAMLResponse'}",
            f"Decoded XML:\n{decoded_xml[:2000]}...",
            "\n--- SECURITY ADVISORY ---"
        ]

        if "AssertionConsumerServiceURL" in decoded_xml:
            analysis.append("- ACS URL found. Check for open redirects or ACS spoofing.")
        if "Signature" not in decoded_xml:
            analysis.append("- [!] WARNING: No Signature found! Possible signature bypass vulnerability.")
        if "AuthnContextClassRef" in decoded_xml:
            analysis.append("- Auth context detected. Check for 2FA/MFA requirements.")
        
        analysis.append("\nATTACK SUGGESTION: Use `python_generator` to implement XML Signature Wrapping (XSW) or comment-out vulnerabilities if a signature is present but weak.")

        return {
            "success": True,
            "result": "\n".join(analysis),
            "xml": decoded_xml
        }
