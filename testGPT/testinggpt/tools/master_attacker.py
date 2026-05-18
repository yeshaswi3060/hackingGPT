"""Master Attacker Tool — the 'Absolute Dominator' entry point."""

import asyncio
from typing import Any, Dict, List
from testinggpt.tools.base import BaseTool
from testinggpt.tools.crawler import DomainCrawlerTool
from testinggpt.tools.fuzzer import FuzzerTool
from testinggpt.tools.secret_harvester import SecretHarvesterTool
from testinggpt.tools.exploit_search import GlobalExploitSearchTool
from testinggpt.core.events import EventBus

class MasterAttackerTool(BaseTool):
    """The Ultimate Tool for autonomous domain domination."""

    def __init__(self) -> None:
        """Initialize MasterAttackerTool."""
        super().__init__(
            name="master_attacker",
            description="Run a full-spectrum, multi-stage autonomous attack on a target domain. Includes crawling, fuzzing, secret harvesting, and exploit searching."
        )

    def get_schema(self) -> dict[str, Any]:
        """Get parameter schema."""
        return {
            "type": "object",
            "properties": {
                "target_url": {
                    "type": "string",
                    "description": "The base URL to dominate (e.g., https://example.com)."
                },
                "aggression_level": {
                    "type": "integer",
                    "description": "Attack intensity (1-5).",
                    "default": 5
                }
            },
            "required": ["target_url"]
        }

    async def execute(self, target_url: str, aggression_level: int = 5, **kwargs: Any) -> dict[str, Any]:
        if not target_url:
            return {"success": False, "result": "No target URL provided."}

        ev = EventBus.get()
        ev.emit_message(f"💀 [MASTER ATTACKER] Initiating TOTAL DOMINATION on {target_url} (Aggression: {aggression_level})", "warning")

        # Instantiate sub-tools
        crawler = DomainCrawlerTool()
        fuzzer = FuzzerTool()
        harvester = SecretHarvesterTool()
        searcher = GlobalExploitSearchTool()

        # Step 1: Crawling & Mapping
        ev.emit_message("🔍 [STAGE 1] Mapping Domain Surface...", "info")
        crawl_res = await crawler.execute(url=target_url)
        
        # Step 2: Hidden Path Discovery
        ev.emit_message("🕵️ [STAGE 2] Fuzzing for Hidden Assets...", "info")
        fuzz_res = await fuzzer.execute(base_url=target_url)

        # Step 3: Secret & Credential Harvesting
        ev.emit_message("🔑 [STAGE 3] Harvesting Secrets and API Keys...", "info")
        harvest_res = await harvester.execute(url=target_url)

        # Step 4: Exploit Discovery
        ev.emit_message("💣 [STAGE 4] Searching for Global Exploits...", "info")
        # Identify tech from previous stages for better search
        tech_query = target_url # Simple fallback
        search_res = await searcher.execute(query=tech_query)

        summary = [
            f"=== DOMINATION REPORT: {target_url} ===",
            f"Crawl Result: {crawl_res.get('result', 'None')[:200]}...",
            f"Fuzz Result: {fuzz_res.get('result', 'None')[:200]}...",
            f"Harvester Result: {harvest_res.get('result', 'None')[:200]}...",
            f"Exploit Result: {search_res.get('result', 'None')[:200]}...",
            "\n[!] Mission Status: PERSISTENT EXPLOITATION ACTIVE."
        ]

        return {
            "success": True,
            "result": "\n\n".join(summary),
            "stages_completed": ["Crawl", "Fuzz", "Harvest", "Search"]
        }
