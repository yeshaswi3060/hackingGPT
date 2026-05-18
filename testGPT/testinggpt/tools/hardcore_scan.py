"""Hardcore scanning tool for testinggpt — orchestrates multiple recon techniques."""

import asyncio
import os
import re
import shutil
import requests
import urllib3
from typing import Any, List, Set, Dict
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup

# Disable insecure request warnings for target scans
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

from testinggpt.tools.base import BaseTool
from testinggpt.core.events import EventBus


class HardcoreScanTool(BaseTool):
    """Tool for performing a comprehensive security scan of a website."""

    def __init__(self) -> None:
        """Initialize HardcoreScanTool."""
        super().__init__(
            name="hardcore_scan",
            description="Perform a comprehensive 'hardcore' scan of a website for vulnerabilities, tech stack, open ports, and leaked secrets (API keys, etc.)."
        )
        # Common regex patterns for secret leakage
        self.secret_patterns = {
            "Google API Key": r"AIza[0-9A-Za-z-_]{30,45}",
            "AWS Access Key": r"AKIA[0-9A-Z]{16}",
            "Firebase Config": r"apiKey\s*:\s*['\"]([^'\"]+)['\"]",
            "General Secret/Token": r"(?i)(?:secret|api[_-]?key|token|password|auth|creds)[^A-Z0-9]{1,10}['\"]([A-Za-z0-9+/=]{32,})['\"]",
            "Myntra Secret": r"myntra-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",
            "Generic Bearer Token": r"Bearer\s+[A-Za-z0-9\-._~+/]+=*",
            "GitHub Personal Access Token": r"ghp_[a-zA-Z0-9]{36}",
            "Slack Webhook": r"https://hooks\.slack\.com/services/T[a-zA-Z0-9_]+/B[a-zA-Z0-9_]+/[a-zA-Z0-9_]+",
            "Stripe API Key": r"(?:sk|pk)_(?:test|live)_[0-9a-zA-Z]{18,32}"
        }

    def get_schema(self) -> dict[str, Any]:
        """Get parameter schema for hardcore scanning."""
        return {
            "type": "object",
            "properties": {
                "url": {
                    "type": "string",
                    "description": "The target website URL (e.g., 'https://example.com')"
                },
                "aggressive": {
                    "type": "boolean",
                    "description": "Whether to perform more aggressive/noisier scans.",
                    "default": False
                }
            },
            "required": ["url"]
        }

    async def _emit(self, finding_type: str, severity: str, description: str, evidence: str = "", confidence: int = 80):
        """Emit a finding to the event bus."""
        try:
            events = EventBus.get()
            events.emit_finding({
                "type": finding_type,
                "severity": severity,
                "description": description,
                "confidence": confidence,
                "evidence": evidence,
                "mitigation": "Review and secure the affected resource. rotate any leaked credentials immediately.",
                "thought": f"Hardcore Scan identified a potential {finding_type}.",
                "waf_status": "UNKNOWN"
            })
        except:
            pass

    async def _run_command(self, cmd: str, timeout: int = 60) -> str:
        """Helper to run a shell command and return output."""
        try:
            process = await asyncio.create_subprocess_shell(
                cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=timeout)
            return f"{stdout.decode(errors='ignore')}\n{stderr.decode(errors='ignore')}".strip()
        except Exception as e:
            return f"Error running '{cmd}': {str(e)}"

    async def execute(self, url: str = "", aggressive: bool = False, **kwargs: Any) -> dict[str, Any]:
        """Execute the hardcore scan."""
        if not url:
            return {"success": False, "result": "", "error": "No URL provided"}

        if not url.startswith(("http://", "https://")):
            url = f"https://{url}"

        parsed_url = urlparse(url)
        domain = parsed_url.netloc
        if not domain:
            return {"success": False, "result": "", "error": "Invalid URL/Domain"}

        results = []
        events = EventBus.get()
        events.emit_message(f"🚀 Starting Hardcore Scan for {url}...", "info")

        # ─── Step 1: WAF & Tech Check ───
        events.emit_message("🔍 Checking for WAF and Tech Stack...", "info")
        waf_output = await self._run_command(f"wafw00f {url}")
        results.append(f"--- WAF DETECTION ---\n{waf_output}")
        
        whatweb_output = await self._run_command(f"whatweb {url}")
        results.append(f"--- TECH STACK ---\n{whatweb_output}")

        # ─── Step 2: Nmap Scan ───
        events.emit_message("📡 Scanning common ports...", "info")
        nmap_cmd = f"nmap -T4 -F {domain}" if not aggressive else f"nmap -T4 -A {domain}"
        nmap_output = await self._run_command(nmap_cmd, timeout=300)
        results.append(f"--- PORT SCAN ---\n{nmap_output}")
        
        # Parse Nmap for findings
        if "open" in nmap_output.lower():
            await self._emit("Open Ports", "Medium", f"Discovered open ports on {domain}.", nmap_output, 90)

        # ─── Step 3: Directory Discovery (Light) ───
        events.emit_message("📂 Searching for sensitive directories...", "info")
        # Just check common paths for speed in this tool
        common_paths = [".env", ".git/config", "wp-config.php", "config.php", "phpinfo.php", "admin/", "backup.zip", "data.sql"]
        found_paths = []
        
        def check_path(p):
            try:
                r = requests.get(urljoin(url, p), timeout=5, verify=False, allow_redirects=False)
                if r.status_code == 200:
                    return p, r.status_code
            except:
                pass
            return None

        # Run in parallel
        loop = asyncio.get_event_loop()
        path_checks = [loop.run_in_executor(None, check_path, p) for p in common_paths]
        path_results = await asyncio.gather(*path_checks)
        
        for r in path_results:
            if r:
                found_paths.append(f"{r[0]} (Code: {r[1]})")
                await self._emit("Sensitive Path", "High", f"Found potentially sensitive path: {r[0]}", f"URL: {urljoin(url, r[0])}", 100)

        results.append(f"--- SENSITIVE PATHS ---\n{chr(10).join(found_paths) if found_paths else 'None found'}")

        # ─── Step 4: Secret Scanning (THE CORE) ───
        events.emit_message("🔐 Scanning for leaked credentials and API keys...", "info")
        all_secrets = []
        try:
            response = requests.get(url, timeout=10, verify=False)
            html_content = response.text
            soup = BeautifulSoup(html_content, "html.parser")
            
            # Find all scripts
            scripts = []
            for script in soup.find_all("script"):
                src = script.get("src")
                if src:
                    scripts.append(urljoin(url, src))
            
            # Extract inline scripts
            inline_scripts = [s.string for s in soup.find_all("script") if s.string]
            
            def scan_text(text, source_name):
                found = []
                for name, pattern in self.secret_patterns.items():
                    matches = re.finditer(pattern, text)
                    for match in matches:
                        secret_val = match.group(0)
                        # Avoid duplicates and very short matches
                        if len(secret_val) > 8:
                            # Context
                            start = max(0, match.start() - 40)
                            end = min(len(text), match.end() + 40)
                            context = text[start:end].replace("\n", " ").strip()
                            found.append({
                                "type": name,
                                "value": secret_val,
                                "source": source_name,
                                "context": context
                            })
                return found

            all_secrets.extend(scan_text(html_content, "Main HTML"))
            for i, s in enumerate(inline_scripts):
                all_secrets.extend(scan_text(s, f"Inline Script #{i}"))
            
            # Fetch and scan external scripts
            scanned_scripts = 0
            for script_url in list(set(scripts)): # Unique scripts
                if scanned_scripts >= 15: break # Limit
                try:
                    events.emit_message(f"  Checking {script_url.split('/')[-1]}...", "info")
                    r = requests.get(script_url, timeout=10, verify=False)
                    if r.status_code == 200:
                        all_secrets.extend(scan_text(r.text, script_url))
                        scanned_scripts += 1
                except:
                    continue
            
            if all_secrets:
                secret_summary = []
                # Deduplicate based on value and source
                unique_secrets = []
                seen_vals = set()
                for s in all_secrets:
                    key = (s['value'], s['source'])
                    if key not in seen_vals:
                        unique_secrets.append(s)
                        seen_vals.add(key)

                for s in unique_secrets:
                    secret_summary.append(f"- [{s['type']}] found in {s['source']}\n  Context: ...{s['context']}...")
                    await self._emit("Credential Leak", "Critical", f"Potential {s['type']} leaked in frontend assets.", f"Value: {s['value']}\nSource: {s['source']}\nContext: {s['context']}", 95)
                
                results.append(f"--- CREDENTIAL SCAN ---\nFound {len(unique_secrets)} potential secrets:\n" + "\n".join(secret_summary))
            else:
                results.append("--- CREDENTIAL SCAN ---\nNo obvious secrets found in the scanned assets.")

        except Exception as e:
            results.append(f"--- CREDENTIAL SCAN ERROR ---\n{str(e)}")

        events.emit_message("✅ Hardcore Scan complete!", "info")
        
        final_result = "\n\n".join(results)
        
        return {
            "success": True,
            "result": f"Hardcore Scan results for {url}:\n\n{final_result}",
            "findings_count": len(all_secrets) + len(found_paths)
        }
