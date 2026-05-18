"""Subdomain Dominator Tool — passive recon at scale."""

import requests
import re
from typing import Any, Dict, List, Set
from testinggpt.tools.base import BaseTool

class SubdomainDominatorTool(BaseTool):
    """Tool for finding subdomains using passive sources like crt.sh."""

    def __init__(self) -> None:
        """Initialize SubdomainDominatorTool."""
        super().__init__(
            name="subdomain_dominator",
            description="Find all subdomains for a given domain using passive reconnaissance (CRT.sh)."
        )

    def get_schema(self) -> dict[str, Any]:
        """Get parameter schema for subdomain discovery."""
        return {
            "type": "object",
            "properties": {
                "domain": {
                    "type": "string",
                    "description": "The root domain to scan (e.g., 'example.com')."
                }
            },
            "required": ["domain"]
        }

    async def execute(self, domain: str = "", **kwargs: Any) -> dict[str, Any]:
        """Execute the subdomain discovery."""
        if not domain:
            return {"success": False, "result": "", "error": "No domain provided"}

        # Basic cleanup: remove protocol if provided
        domain = domain.replace("http://", "").replace("https://", "").split("/")[0]

        subdomains: Set[str] = set()
        
        try:
            # Source 1: CRT.sh (Certificate Transparency)
            url = f"https://crt.sh/?q=%25.{domain}&output=json"
            response = requests.get(url, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                for entry in data:
                    name = entry.get("name_value", "")
                    if name:
                        # Names can be multiple (separated by \n)
                        for n in name.split("\n"):
                            clean_n = n.strip().lower()
                            if clean_n.endswith(domain) and "*" not in clean_n:
                                subdomains.add(clean_n)
            
            result_list = sorted(list(subdomains))
            result_msg = f"--- SUBDOMAIN DISCOVERY FOR {domain} ---\n\n"
            if result_list:
                result_msg += "\n".join(result_list)
            else:
                result_msg += "No subdomains found."

            return {
                "success": True,
                "result": result_msg,
                "subdomains": result_list
            }

        except Exception as e:
            return {"success": False, "result": "", "error": str(e)}
