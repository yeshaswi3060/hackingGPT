"""Domain Crawler Tool — recursively find all endpoints for analysis."""

import requests
import urllib3
import re
from typing import Any, Dict, List, Set, Optional
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from testinggpt.tools.base import BaseTool

# Disable insecure request warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class DomainCrawlerTool(BaseTool):
    """Tool for recursively mapping internal links, forms, and assets on a domain."""

    def __init__(self) -> None:
        """Initialize DomainCrawlerTool."""
        super().__init__(
            name="domain_crawler",
            description="Find all internal links, folders, and resources in a domain. Use for 'One-by-One' attack strategy."
        )

    def get_schema(self) -> dict[str, Any]:
        """Get parameter schema for domain crawling."""
        return {
            "type": "object",
            "properties": {
                "url": {
                    "type": "string",
                    "description": "The base URL to start crawling from (e.g., 'https://domain.com')"
                },
                "depth": {
                    "type": "integer",
                    "description": "Maximum recursion depth (default 3)",
                    "default": 3
                },
                "max_pages": {
                    "type": "integer",
                    "description": "Maximum number of unique pages to discover (default 50)",
                    "default": 50
                }
            },
            "required": ["url"]
        }

    async def execute(self, url: str = "", depth: int = 3, max_pages: int = 50, **kwargs: Any) -> dict[str, Any]:
        """Execute the recursive domain crawler."""
        if not url:
            return {"success": False, "result": "", "error": "No URL provided"}

        if not url.startswith(("http://", "https://")):
            url = f"https://{url}"
        
        parsed_base = urlparse(url)
        domain = parsed_base.netloc
        if not domain:
            return {"success": False, "result": "", "error": f"Invalid URL: {url}"}

        visited: Set[str] = set()
        queue: List[tuple[str, int]] = [(url, 0)]
        results: Dict[str, Any] = {
            "links": [],
            "forms": [],
            "assets": [],
            "subdomains": set()
        }

        session = requests.Session()
        session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        })

        while queue and len(visited) < max_pages:
            curr_url, curr_depth = queue.pop(0)
            
            # Clean URL (remove anchors)
            curr_url = curr_url.split('#')[0]
            if curr_url in visited:
                continue
            
            visited.add(curr_url)
            
            try:
                response = session.get(curr_url, timeout=10, verify=False)
                if response.status_code != 200:
                    continue
                
                results["links"].append(curr_url)
                
                # Check for forms
                if "text/html" in response.headers.get("Content-Type", "").lower():
                    soup = BeautifulSoup(response.text, "html.parser")
                    
                    # 1. Discover Links
                    if curr_depth < depth:
                        for a in soup.find_all('a', href=True):
                            next_url = urljoin(curr_url, a['href'])
                            parsed_next = urlparse(next_url)
                            
                            # Only crawl same domain or subdomains
                            if parsed_next.netloc == domain:
                                queue.append((next_url, curr_depth + 1))
                            elif parsed_next.netloc.endswith(domain):
                                results["subdomains"].add(parsed_next.netloc)
                    
                    # 2. Discover Forms (for attack mapping)
                    for form in soup.find_all('form'):
                        action = form.get('action')
                        method = form.get('method', 'GET').upper()
                        inputs = [i.get('name') for i in form.find_all(['input', 'textarea', 'select']) if i.get('name')]
                        results["forms"].append({
                            "url": curr_url,
                            "action": urljoin(curr_url, action) if action else curr_url,
                            "method": method,
                            "inputs": inputs
                        })
                    
                    # 3. Discover Assets (.php, .js, .json)
                    for script in soup.find_all('script', src=True):
                        results["assets"].append(urljoin(curr_url, script['src']))

            except Exception as e:
                # Log error and continue
                pass

        results["subdomains"] = list(results["subdomains"])
        
        summary = (
            f"🎯 Domain Map for {url} COMPLETE.\n"
            f"- Unique internal links discovered: {len(results['links'])}\n"
            f"- Forms identified for testing: {len(results['forms'])}\n"
            f"- External/Subdomain links found: {len(results['subdomains'])}\n\n"
            f"TOP TARGETS (One-by-One):\n" + 
            "\n".join([f"  [PAGE] {l}" for l in results['links'][:15]])
        )

        return {
            "success": True,
            "result": summary,
            "data": results,
            "error": None
        }
