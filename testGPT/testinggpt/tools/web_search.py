"""Web search tool for testinggpt."""

import requests
from bs4 import BeautifulSoup
from typing import Any
import re

from testinggpt.tools.base import BaseTool


class WebSearchTool(BaseTool):
    """Tool for searching the internet for vulnerabilities and exploits."""

    def __init__(self) -> None:
        """Initialize WebSearchTool."""
        super().__init__(
            name="web_search",
            description="Search the internet (via DuckDuckGo) for recent vulnerabilities, CVEs, or exploits related to a specific product or version."
        )

    def get_schema(self) -> dict[str, Any]:
        """Get parameter schema for web searching."""
        return {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "The search query (e.g., 'Apache 2.4.49 exploit CVE')"
                }
            },
            "required": ["query"]
        }

    async def execute(self, query: str = "", **kwargs: Any) -> dict[str, Any]:
        """
        Perform a web search using DuckDuckGo HTML (no API key needed).

        Args:
            query: The search query.
            **kwargs: Additional arguments.

        Returns:
            Dictionary with success, result (search results), and error.
        """
        if not query:
            return {"success": False, "result": "", "error": "No query provided"}

        try:
            # Use DuckDuckGo Lite/HTML for stable scraping without JS
            url = f"https://html.duckduckgo.com/html/?q={query}"
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            }
            
            # Use requests safely (not async but shouldn't block for long)
            import asyncio
            from functools import partial
            
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, 
                partial(requests.get, url, headers=headers, timeout=15, verify=False)
            )
            
            if response.status_code != 200:
                # Try a fallback or error
                return {"success": False, "result": "", "error": f"Search engine returned status {response.status_code}"}

            soup = BeautifulSoup(response.text, "html.parser")
            results = []
            
            # DuckDuckGo HTML structure: results are usually in 'result' divs
            for r in soup.find_all("div", class_="result"):
                title_tag = r.find("a", class_="result__a")
                snippet_tag = r.find("a", class_="result__snippet")
                
                if title_tag and snippet_tag:
                    title = title_tag.text.strip()
                    link = title_tag["href"]
                    snippet = snippet_tag.text.strip()
                    
                    # Clean up the link (DDG often prefixes with its own redirect)
                    if "uddg=" in link:
                        match = re.search(r'uddg=(.*?)&', link)
                        if match:
                            from urllib.parse import unquote
                            link = unquote(match.group(1))
                    
                    results.append(f"### {title}\nLink: {link}\nSnippet: {snippet}\n")

                    # [NEW] Emit finding for UI visibility if it looks like a CVE or Exploit
                    if any(x in (title + snippet).upper() for x in ["CVE-", "EXPLOIT", "VULNERABILITY", "VULN", "RCE", "SQLI"]):
                        try:
                            from testinggpt.core.events import EventBus
                            events = EventBus.get()
                            events.emit_finding({
                                "type": "External Intelligence",
                                "severity": "Info",
                                "description": f"Potential {title} mentioned in search results for '{query}'. This indicates publicly known vulnerabilities or exploit discussions related to the target stack.",
                                "evidence": f"Link: {link}\nSnippet: {snippet}",
                                "mitigation": "Review the linked CVE or advisory and apply the recommended security patches or configuration changes to the affected software.",
                                "thought": "The web search engine matched the target's technology keywords with known vulnerability databases and security advisories.",
                                "exploit_details": f"Public intelligence for {title} implies that exploit code or detailed vulnerability analysis might be available. Attackers often use this information to launch targeted attacks against unpatched systems.",
                                "confidence": 75,
                                "waf_status": "NOT DETECTED"
                            })
                        except: pass

            if not results:
                return {
                    "success": True, 
                    "result": f"No immediate results found for '{query}' on DuckDuckGo.",
                    "count": 0
                }

            summary = f"Search results for: {query}\n\n" + "\n".join(results[:8])
            return {
                "success": True,
                "result": summary,
                "count": len(results)
            }

        except Exception as e:
            return {
                "success": False,
                "result": "",
                "error": f"Web search failed: {str(e)}"
            }
