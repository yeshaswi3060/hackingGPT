"""XML-RPC tool for testinggpt — handles WordPress/Generic XML-RPC attacks."""

import requests
import urllib3
from typing import Any, Dict, List, Optional
from testinggpt.tools.base import BaseTool

# Disable insecure request warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class XMLRPCTool(BaseTool):
    """Tool for interacting with and exploiting XML-RPC endpoints."""

    def __init__(self) -> None:
        """Initialize XMLRPCTool."""
        super().__init__(
            name="xmlrpc_tool",
            description="Perform XML-RPC requests to a target URL (e.g., WordPress). Use for method enumeration, brute-force, or pingback attacks."
        )

    def get_schema(self) -> dict[str, Any]:
        """Get parameter schema for XML-RPC requests."""
        return {
            "type": "object",
            "properties": {
                "url": {
                    "type": "string",
                    "description": "The XML-RPC endpoint URL (e.g., 'https://example.com/xmlrpc.php')"
                },
                "method_name": {
                    "type": "string",
                    "description": "The XML-RPC method name to call (e.g., 'system.listMethods', 'wp.getUsersBlogs', 'demo.sayHello')",
                    "default": "system.listMethods"
                },
                "params": {
                    "type": "array",
                    "description": "List of parameters for the XML-RPC method.",
                    "items": {"type": "string"},
                    "default": []
                }
            },
            "required": ["url"]
        }

    async def execute(self, url: str = "", method_name: str = "system.listMethods", params: Optional[List[str]] = None, **kwargs: Any) -> dict[str, Any]:
        """Execute the XML-RPC request."""
        if not url:
            return {"success": False, "result": "", "error": "No URL provided"}

        if not url.startswith(("http://", "https://")):
            url = f"https://{url}"
        
        if params is None:
            params = []

        # Construct XML payload
        xml_params = ""
        for p in params:
            xml_params += f"<param><value><string>{p}</string></value></param>"

        data = f"""<?xml version='1.0'?>
<methodCall>
<methodName>{method_name}</methodName>
<params>
{xml_params}
</params>
</methodCall>"""

        headers = {'Content-Type': 'text/xml'}

        try:
            response = requests.post(url, headers=headers, data=data, verify=False, timeout=15)
            
            return {
                "success": response.status_code == 200,
                "status_code": response.status_code,
                "result": response.text,
                "error": None if response.status_code == 200 else f"Request failed with status {response.status_code}"
            }
        except Exception as e:
            return {"success": False, "result": "", "error": str(e)}
