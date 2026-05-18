"""Tool for reporting security findings/vulnerabilities."""

from typing import Any, Dict
from testinggpt.tools.base import BaseTool
from testinggpt.core.events import EventBus

class FindingTool(BaseTool):
    """Tool that allows the agent to formally report a security finding."""

    def __init__(self) -> None:
        """Initialize FindingTool."""
        super().__init__(
            name="finding_found",
            description="Report a discovered security vulnerability or finding to the dashboard."
        )

    def get_schema(self) -> dict[str, Any]:
        """Get parameter schema for reporting findings."""
        return {
            "type": "object",
            "properties": {
                "type": {
                    "type": "string",
                    "description": "The category of the finding (e.g., SECRET_LEAK, SQL_INJECTION, XSS)."
                },
                "severity": {
                    "type": "string",
                    "description": "Severity level: Critical, High, Medium, Low, or Info."
                },
                "description": {
                    "type": "string",
                    "description": "Detailed description of the finding."
                },
                "confidence": {
                    "type": "integer",
                    "description": "Confidence level in the finding (0-100)."
                },
                "evidence": {
                    "type": "string",
                    "description": "The actual evidence (code snippet, URL, payload) that proves the finding."
                },
                "mitigation": {
                    "type": "string",
                    "description": "Recommended steps to fix or mitigate the vulnerability."
                },
                "thought": {
                    "type": "string",
                    "description": "AI analysis of the finding."
                },
                "exploit_details": {
                    "type": "string",
                    "description": "Detailed 'Hacker's Perspective' on how the vulnerability could be exploited."
                },
                "waf_status": {
                    "type": "string",
                    "description": "Whether a WAF was detected (e.g., 'DETECTED', 'NOT DETECTED')."
                }
            },
            "required": ["type", "severity", "description", "confidence"]
        }

    async def execute(self, **kwargs: Any) -> dict[str, Any]:
        """Execute the finding report."""
        try:
            events = EventBus.get()
            # Emit a finding event
            events.emit_finding({
                "type": kwargs.get("type", "UNKNOWN"),
                "severity": kwargs.get("severity", "Informational"),
                "description": kwargs.get("description", ""),
                "confidence": kwargs.get("confidence", 100),
                "evidence": kwargs.get("evidence", ""),
                "mitigation": kwargs.get("mitigation", ""),
                "thought": kwargs.get("thought", ""),
                "exploit_details": kwargs.get("exploit_details", ""),
                "waf_status": kwargs.get("waf_status", "NOT DETECTED")
            })
            
            return {
                "success": True,
                "result": f"Finding reported successfully: {kwargs.get('type')}",
                "error": None
            }
        except Exception as e:
            return {
                "success": False,
                "result": None,
                "error": f"Failed to report finding: {str(e)}"
            }
