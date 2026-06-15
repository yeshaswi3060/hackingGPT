from fastapi import FastAPI, Request, UploadFile, File
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import asyncio
import json
import os
import logging
from typing import AsyncGenerator
from pathlib import Path

from testinggpt.core.events import Event, EventBus, EventType
import requests
try:
    from bs4 import BeautifulSoup, Comment
    _BS4_AVAILABLE = True
except ImportError:
    _BS4_AVAILABLE = False
    BeautifulSoup = None
    Comment = None
from urllib.parse import urljoin, urlparse
import tempfile
import time
import re

from testinggpt.core.controller import AgentController
from testinggpt.core.config import load_config

app = FastAPI(title="testinggpt Web Dashboard")

# Enable CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
controller: AgentController = None
events = EventBus.get()

# Store initial settings from CLI
initial_settings = {
    "target": "",
    "instruction": "",
    "model": "",
    "backend": "litellm"
}

# Store events for late-joining clients
event_history = []

def event_listener(event: Event):
    """Capture events and store in history."""
    global audit_results
    event_data = {
        "type": event.type.name,
        "data": event.data,
        "metadata": event.metadata,
        "timestamp": event.timestamp.isoformat()
    }
    
    # Sync finding events to the generic audit_results for UI reporting
    if event.type == EventType.FINDING_FOUND:
        finding = event.data.get("finding", {})
        audit_results.append({
            "type": "ISSUE",
            "severity": finding.get("severity", "Medium").upper(),
            "line": 0,
            "title": finding.get("type", "Security Finding"),
            "description": f"{finding.get('description', '')}\n\n**[EVIDENCE]**\n{finding.get('evidence', 'No specific evidence provided.')}\n\n**[MITIGATION]**\n{finding.get('mitigation', 'No mitigation steps provided.')}",
            "evidence": finding.get("evidence", ""),
            "mitigation": finding.get("mitigation", ""),
            "thought": finding.get("thought", ""),
            # Detail Modal Fields
            "exploit_details": finding.get("thought") or finding.get("mitigation") or "No further exploitation details were provided by the agent for this finding.",
            "confidence": finding.get("confidence", 100),
            "waf_status": finding.get("waf_status", "NOT DETECTED"),
            "timestamp": event_data["timestamp"]
        })
        
    event_history.append(event_data)
    # Keep last 1000 events to support aggressive recursive scans
    if len(event_history) > 1000:
        event_history.pop(0)

events.subscribe(EventType.MESSAGE, event_listener)
events.subscribe(EventType.STATE_CHANGED, event_listener)
events.subscribe(EventType.TOOL, event_listener)
events.subscribe(EventType.FLAG_FOUND, event_listener)
events.subscribe(EventType.FINDING_FOUND, event_listener)
events.subscribe(EventType.COOLDOWN_START, event_listener)
events.subscribe(EventType.INPUT_REQUIRED, event_listener)
events.subscribe(EventType.GRAPH_UPDATE, event_listener)
events.subscribe(EventType.CODEGEN, event_listener)

async def _perform_scan(target: str, instruction: str = "", model: str = None, backend: str = "litellm", use_audit_findings: bool = False):
    """Helper to initialize and start a scan task."""
    global controller
    
    # Filter out None values
    config_overrides = {
        "target": target,
        "custom_instruction": instruction,
        "backend_type": backend
    }
    if model:
        config_overrides["llm_model"] = model
        if model.startswith("nvidia_nim/"):
            config_overrides["llm_api_base"] = "https://integrate.api.nvidia.com/v1"
    
    print(f"DEBUG: Initializing scan for {target}")
    config = load_config(**config_overrides)
    controller = AgentController(config)
    event_history.clear()
    
    task_desc = f"Scan target: {target}"
    
    # Inject code audit findings if requested
    if use_audit_findings and audit_results:
        issues = [r for r in audit_results if r["type"] == "ISSUE"]
        if issues:
            findings_text = "\n\n[!!! STRICT FOCUS MISSION: CODE AUDIT FINDINGS DETECTED !!!]\n"
            findings_text += "DANGER: Source code vulnerabilities have been pre-identified. "
            findings_text += "You are ordered to EXCLUSIVELY target and exploit these specific areas. "
            findings_text += "Do not waste time on general scanning. Focus on these documented issues:\n"
            for find in issues:
                findings_text += f"- [{find['severity']}] {find['file']}:{find['line']} — {find['title']}: {find['description']}\n"
            
            task_desc += findings_text
            print(f"DEBUG: Injected {len(issues)} code audit findings into task description.")

    if instruction:
        task_desc += f"\nContext: {instruction}"
        
    async def run_scan_with_log():
        try:
            print(f"DEBUG: Background scan task starting for {target}")
            print(f"DEBUG: Model: {model}, Backend: {backend}")
            result = await controller.run(task_desc)
            print(f"DEBUG: Background scan task finished for {target}. Result: {result}")
        except Exception as e:
            print(f"ERROR: Background scan task failed: {e}")
            import traceback
            traceback.print_exc()
            # Emit an error event so the UI knows it failed
            from testinggpt.core.events import EventType
            events.emit_state("error", f"Startup failed: {str(e)}")

    asyncio.create_task(run_scan_with_log())
    return {"success": True, "message": "Scan started"}

@app.on_event("startup")
async def startup_event():
    """Check for initial settings and start scan if target is provided."""
    target = initial_settings.get("target")
    if target:
        print(f"DEBUG: Initial target found on startup: {target}. Auto-starting scan...")
        await _perform_scan(
            target=target,
            instruction=initial_settings.get("instruction", ""),
            model=initial_settings.get("model"),
            backend=initial_settings.get("backend", "litellm")
        )

@app.post("/api/tool/skip")
async def skip_tool():
    """Trigger the SKIP_TOOL event to terminate the current tool."""
    events.emit_skip_tool()
    return {"success": True, "message": "Skip signal emitted"}

@app.post("/api/scan/retry")
async def retry_scan():
    """Manually trigger a retry/resume."""
    if controller and controller.resume("Manual retry requested by user."):
        return {"success": True, "message": "Retry signal sent"}
    return {"success": False, "error": "Agent is not in a resumable state or not initialized"}

@app.post("/api/scan")
async def start_scan(request: Request):
    data = await request.json()
    target = data.get("target")
    if not target:
        return {"success": False, "error": "Target is required"}
        
    return await _perform_scan(
        target=target,
        instruction=data.get("instruction", ""),
        model=data.get("model"),
        backend=data.get("backend", "litellm"),
        use_audit_findings=data.get("use_audit_findings", False)
    )

@app.get("/api/initial-settings")
async def get_initial_settings():
    return initial_settings

@app.get("/api/network-info")
async def get_network_info():
    """Get local IP and suggested subnet for scanning."""
    import socket
    try:
        # Get local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0)
        try:
            # doesn't even have to be reachable
            s.connect(('8.8.8.8', 1))
            local_ip = s.getsockname()[0]
        except Exception:
            local_ip = '127.0.0.1'
        finally:
            s.close()
        
        # Suggest a /24 subnet based on local IP
        if local_ip != '127.0.0.1':
            parts = local_ip.split('.')
            subnet = f"{parts[0]}.{parts[1]}.{parts[2]}.0/24"
        else:
            subnet = "127.0.0.1/32"
            
        return {
            "success": True, 
            "ip": local_ip,
            "subnet": subnet
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/api/events")
async def stream_events():
    async def event_generator() -> AsyncGenerator[str, None]:
        # Send history first
    # TODO: Web UI
    # - [x] Implement: Advanced Pentesting Suite <!-- id: 135 -->
    #   - [x] Implement: Automated Exploit Matching (SearchSploit) <!-- id: 136 -->
    #   - [x] Implement: Visual Attack Graph (Nodes & Paths) <!-- id: 137 -->
    #   - [x] Implement: Blurred Modal UI for Attack Graph <!-- id: 138 -->
    #   - [x] Implement: WAF Evasion & Stealth Intelligence <!-- id: 139 -->
    #   - [x] Verify Advanced Suite integration <!-- id: 140 -->
        for event in event_history:
            yield f"data: {json.dumps(event)}\n\n"
            
        # Then stream new events
        queue = asyncio.Queue()
        
        def put_in_queue(event: Event):
            event_data = {
                "type": event.type.name,
                "data": event.data,
                "metadata": event.metadata,
                "timestamp": event.timestamp.isoformat()
            }
            queue.put_nowait(event_data)
            
        events.subscribe(EventType.MESSAGE, put_in_queue)
        events.subscribe(EventType.STATE_CHANGED, put_in_queue)
        events.subscribe(EventType.TOOL, put_in_queue)
        events.subscribe(EventType.FLAG_FOUND, put_in_queue)
        events.subscribe(EventType.FINDING_FOUND, put_in_queue)
        events.subscribe(EventType.COOLDOWN_START, put_in_queue)
        events.subscribe(EventType.INPUT_REQUIRED, put_in_queue)
        events.subscribe(EventType.GRAPH_UPDATE, put_in_queue)
        events.subscribe(EventType.CODEGEN, put_in_queue)
        
        try:
            while True:
                try:
                    # Wait for an event with a timeout for heartbeat
                    event = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield f"data: {json.dumps(event)}\n\n"
                except asyncio.TimeoutError:
                    # Heartbeat
                    yield f"data: {json.dumps({'type': 'HEARTBEAT', 'data': {}, 'timestamp': ''})}\n\n"
        except (ConnectionResetError, asyncio.CancelledError):
            # Normal on browser refresh/close
            pass
        finally:
            events.unsubscribe(EventType.MESSAGE, put_in_queue)
            events.unsubscribe(EventType.STATE_CHANGED, put_in_queue)
            events.unsubscribe(EventType.TOOL, put_in_queue)
            events.unsubscribe(EventType.FLAG_FOUND, put_in_queue)
            events.unsubscribe(EventType.FINDING_FOUND, put_in_queue)
            events.unsubscribe(EventType.COOLDOWN_START, put_in_queue)
            events.unsubscribe(EventType.INPUT_REQUIRED, put_in_queue)
            events.unsubscribe(EventType.GRAPH_UPDATE, put_in_queue)
            events.unsubscribe(EventType.CODEGEN, put_in_queue)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.post("/api/command")
async def send_command(request: Request):
    data = await request.json()
    command = data.get("command")
    text = data.get("text")
    print(f"DEBUG: Server received command: {command}, text: {text[:50] if text else 'None'}")
    
    if not controller:
        print("DEBUG: Command failed - No active controller")
        return {"success": False, "error": "No active scan"}
    
    if command == "pause":
        controller.pause()
    elif command == "resume":
        controller.resume()
    elif command == "retry":
        controller.retry()
    elif command == "reset":
        controller.reset_session()
    elif command == "stop":
        controller.stop()
    elif command == "input":
        if text:
            # Direct injection for better reliability
            controller.inject(text)
            events.emit_input(text) # Still emit for other possible listeners
            
    return {"success": True}

# ─── Code Audit Feature ─────────────────────────────────────────────────────

import glob
import litellm

# Supported code file extensions for audit
CODE_EXTENSIONS = {
    '.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.c', '.cpp', '.h', '.hpp',
    '.cs', '.go', '.rb', '.php', '.rs', '.swift', '.kt', '.scala', '.lua',
    '.sh', '.bash', '.ps1', '.bat', '.cmd', '.sql', '.html', '.css', '.xml',
    '.yml', '.yaml', '.json', '.toml', '.ini', '.cfg', '.conf', '.env',
    '.dockerfile', '.tf', '.hcl',
}

# Files/dirs to skip
SKIP_DIRS = {'node_modules', '.git', '__pycache__', 'venv', '.venv', 'env',
             'dist', 'build', '.next', '.nuxt', 'vendor', 'target', 'bin', 'obj'}

audit_results = []
audit_running = False
audit_progress_stats = {"scanned": 0, "total": 0}

def _scan_code_files(folder_path: str) -> list:
    """Recursively find code files in a folder."""
    files = []
    folder = Path(folder_path)
    if not folder.exists() or not folder.is_dir():
        return files
    
    for root, dirs, filenames in os.walk(folder):
        # Skip unwanted directories
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith('.')]
        
        for fname in filenames:
            ext = Path(fname).suffix.lower()
            if ext in CODE_EXTENSIONS:
                full_path = os.path.join(root, fname)
                try:
                    size = os.path.getsize(full_path)
                    if size > 0 and size < 500_000:  # Skip empty and huge files
                        rel_path = os.path.relpath(full_path, folder_path)
                        files.append({"path": full_path, "rel": rel_path, "size": size})
                except OSError:
                    pass
            

    
    return files

def _read_file_safe(path: str, max_chars: int = 8000) -> str:
    """Read a file safely with size limit."""
    try:
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read(max_chars)
        if len(content) == max_chars:
            content += "\n\n... [FILE TRUNCATED] ..."
        return content
    except Exception:
        return ""

@app.post("/api/code-audit")
async def start_code_audit(request: Request):
    """Start a security audit of code in the given folder."""
    global audit_results, audit_running
    
    data = await request.json()
    folder_path = data.get("folder", "")
    model = data.get("model", "groq/llama-3.1-8b-instant")
    
    if not folder_path:
        return {"success": False, "error": "Folder path is required"}
    
    folder = Path(folder_path)
    if not folder.exists():
        return {"success": False, "error": f"Folder not found: {folder_path}"}
    if not folder.is_dir():
        return {"success": False, "error": f"Not a directory: {folder_path}"}
    
    # Find code files
    code_files = _scan_code_files(folder_path)
    if not code_files:
        return {"success": False, "error": "No code files found in the folder"}
    
    audit_results = []
    audit_running = True
    
    # Use Nemotron-3 Super specifically (handle custom user .env naming)
    api_key = os.getenv("NEMOTRON_API_KEY", os.getenv("nemotron-3-super-120b-a12b", ""))
    api_base = os.getenv("NEMOTRON_BASE_URL", os.getenv("base_url", "https://integrate.api.nvidia.com/v1"))
    nemotron_model = os.getenv("NEMOTRON_MODEL", "nvidia_nim/nvidia/nemotron-3-super-120b-a12b")
    
    if controller and hasattr(controller, 'config') and controller.config:
        cfg = controller.config
        api_key = getattr(cfg, 'nemotron_api_key', None) or api_key
        api_base = getattr(cfg, 'nemotron_base_url', None) or api_base
        nemotron_model = getattr(cfg, 'nemotron_model', None) or nemotron_model

    if nemotron_model.startswith("nvidia_nim/"):
        nemotron_model = nemotron_model.replace("nvidia_nim/", "")
        
    if not nemotron_model.startswith("openai/"):
        nemotron_model = f"openai/{nemotron_model}"
        
    model = nemotron_model
    
    global audit_progress_stats
    audit_progress_stats = {"scanned": 0, "total": len(code_files)}
    
    async def run_audit():
        global audit_results, audit_running
        total = len(code_files)
        
        # Emit scan started
        events.emit(Event(type=EventType.MESSAGE, data={
            "text": f"🔍 Code Audit started: scanning {total} files in {folder_path} (Using Nemotron-3 Super)",
            "role": "system"
        }))
        
        for idx, file_info in enumerate(code_files):
            if not audit_running:
                break
                
            audit_progress_stats["scanned"] = idx
            
            content = _read_file_safe(file_info["path"])
            if not content.strip():
                continue
            
            # Emit progress
            events.emit(Event(type=EventType.MESSAGE, data={
                "text": f"📄 Auditing file {idx+1}/{total}: {file_info['rel']}",
                "role": "system"
            }))
            
            prompt = (
                f"You are an expert security code auditor. Analyze the following code file for security vulnerabilities, "
                f"bugs, and code quality issues.\n\n"
                f"FILE: {file_info['rel']}\n"
                f"```\n{content}\n```\n\n"
                f"First, write a <thought>...</thought> block where you reason about the code, trace data flows, "
                f"and evaluate potential vulnerabilities. This is your internal scratchpad.\n\n"
                f"Then, after the thought block, output the final findings in this exact format (one per line):\n"
                f"ISSUE|<severity:CRITICAL/HIGH/MEDIUM/LOW/INFO>|<line_number_or_range>|<issue_title>|<description>\n\n"
                f"If the file has no significant issues, output:\n"
                f"CLEAN|INFO|0|No issues found|This file passes security review.\n\n"
                f"Focus on: SQL injection, XSS, command injection, path traversal, hardcoded secrets, "
                f"insecure crypto, buffer overflows, race conditions, SSRF, authentication bypass, "
                f"insecure deserialization, exposed debug info, missing input validation, and insecure defaults.\n"
            )
            
            try:
                response = await litellm.acompletion(
                    model=model,
                    messages=[
                        {"role": "system", "content": "You are a security code auditor. Output ONLY structured ISSUE lines."},
                        {"role": "user", "content": prompt}
                    ],
                    api_key=api_key,
                    api_base=api_base,
                    num_retries=1,
                    timeout=120
                )
                
                result_text = response.choices[0].message.content.strip()
                
                # Extract thought block
                import re
                thought_process = ""
                thought_match = re.search(r"<thought>(.*?)</thought>", result_text, re.DOTALL | re.IGNORECASE)
                if thought_match:
                    thought_process = thought_match.group(1).strip()
                
                # Parse findings
                for line in result_text.split("\n"):
                    line = line.strip()
                    if not line or not (line.startswith("ISSUE") or line.startswith("CLEAN")):
                        continue
                    parts = line.split("|", 4)
                    if len(parts) >= 5:
                        finding = {
                            "type": parts[0].strip(),
                            "severity": parts[1].strip(),
                            "line": parts[2].strip(),
                            "title": parts[3].strip(),
                            "description": parts[4].strip(),
                            "file": file_info["rel"],
                            "full_path": file_info["path"],
                            "thought": thought_process
                        }
                        audit_results.append(finding)
                        
                        # Emit finding as an event
                        if finding["type"] == "ISSUE":
                            events.emit(Event(type=EventType.MESSAGE, data={
                                "text": f"🚨 [{finding['severity']}] {finding['file']}:{finding['line']} — {finding['title']}: {finding['description'][:200]}",
                                "role": "system"
                            }))
                            
            except Exception as e:
                print(f"DEBUG: [CODE-AUDIT] Error auditing {file_info['rel']}: {e}")
                audit_results.append({
                    "type": "ERROR",
                    "severity": "INFO",
                    "line": "0",
                    "title": f"Audit error for {file_info['rel']}",
                    "description": str(e)[:200],
                    "file": file_info["rel"],
                    "full_path": file_info["path"],
                })
        
        audit_running = False
        audit_progress_stats["scanned"] = total
        
        # Emit summary
        issues = [r for r in audit_results if r["type"] == "ISSUE"]
        critical = len([i for i in issues if i["severity"] == "CRITICAL"])
        high = len([i for i in issues if i["severity"] == "HIGH"])
        medium = len([i for i in issues if i["severity"] == "MEDIUM"])
        low = len([i for i in issues if i["severity"] == "LOW"])
        
        events.emit(Event(type=EventType.MESSAGE, data={
            "text": (
                f"✅ Code Audit Complete!\n"
                f"📁 Files scanned: {total}\n"
                f"🚨 Issues found: {len(issues)} "
                f"(🔴 {critical} Critical, 🟠 {high} High, 🟡 {medium} Medium, 🔵 {low} Low)"
            ),
            "role": "system"
        }))
    
    asyncio.create_task(run_audit())
    
    return {
        "success": True,
        "message": f"Code audit started for {len(code_files)} files",
        "files_count": len(code_files),
        "files": [f["rel"] for f in code_files[:20]]  # Preview first 20
    }

@app.get("/api/code-audit/results")
async def get_audit_results():
    """Get current audit results."""
    issues = [r for r in audit_results if r["type"] == "ISSUE"]
    
    scanned = audit_progress_stats["scanned"]
    total = audit_progress_stats["total"]
    percentage = round((scanned / total * 100)) if total > 0 else 0
    
    return {
        "running": audit_running,
        "total_findings": len(issues),
        "findings": audit_results,
        "progress": {
            "scanned": scanned,
            "total": total,
            "percentage": percentage
        },
        "summary": {
            "critical": len([i for i in issues if i["severity"] == "CRITICAL"]),
            "high": len([i for i in issues if i["severity"] == "HIGH"]),
            "medium": len([i for i in issues if i["severity"] == "MEDIUM"]),
            "low": len([i for i in issues if i["severity"] == "LOW"]),
            "info": len([i for i in issues if i["severity"] == "INFO"]),
        }
    }

@app.post("/api/code-audit/stop")
async def stop_code_audit():
    """Stop the running code audit."""
    global audit_running
    audit_running = False
    return {"success": True, "message": "Code audit stopped"}

@app.post("/api/crawl")
async def crawl_website_api(request: Request):
    """Crawl a website and save source to a temp directory aggressively."""
    data = await request.json()
    url = data.get("url")
    if not url:
        return {"success": False, "error": "URL is required"}
    
    if not url.startswith("http"):
        url = "https://" + url
        
    try:
        domain = urlparse(url).netloc or "unknown"
        temp_dir = os.path.join(tempfile.gettempdir(), f"audit_{domain}_{int(time.time())}")
        os.makedirs(temp_dir, exist_ok=True)
        
        print(f"DEBUG: Aggressive Crawl starting for {url} to {temp_dir}")
        
        from collections import deque
        
        # Configurable limits for "Extreme Aggressive" mode
        MAX_PAGES = 100
        MAX_DEPTH = 3
        
        session = requests.Session()
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
        })
        
        queue = deque([(url, 0)])
        visited = set()
        files_saved = 0
        discovered_subdomains = set()
        
        # 1. Proactive "Sensitive Files & Directories" (Brute-forcing)
        fuzz_list = [
            "/robots.txt", "/sitemap.xml", "/.env", "/.git/config", "/.htaccess", 
            "/web.config", "/manifest.json", "/.DS_Store", "/backup.zip", "/config.php.bak",
            "/admin", "/api", "/v1", "/v2", "/graphql", "/config", "/secret", "/private",
            "/uploads", "/backup", "/db", "/.ssh", "/.aws/credentials", "/phpinfo.php",
            "/server-status", "/.git/HEAD", "/.svn/entries", "/.vscode/settings.json",
            # WordPress & PHP
            "/wp-config.php.bak", "/wp-login.php", "/xmlrpc.php", "/wp-json/wp/v2/users",
            "/wp-content/debug.log", "/wp-admin/admin-ajax.php", "/.php_cs", "/phpmyadmin/",
            # Laravel/Symfony
            "/.env.example", "/storage/logs/laravel.log", "/artisan", "/composer.json", 
            "/composer.lock", "/bin/console",
            # Node.js / React / Angular
            "/package.json", "/package-lock.json", "/.npmrc", "/.yarnrc", "/next.config.js",
            "/webpack.config.js", "/.env.local", "/.env.production", "/.map",
            # Python / Django / Flask
            "/manage.py", "/settings.py.bak", "/requirements.txt", "/Procfile", 
            "/.python-version", "/__pycache__/",
            # Java / Spring
            "/pom.xml", "/build.gradle", "/WEB-INF/web.xml", "/application.properties",
            "/application.yml", "/.metadata/",
            # Shopify & E-commerce
            "/cart.json", "/products.json", "/admin/auth/login", "/checkout", "/shopify-info",
            # Infra & Cloud
            "/.aws/config", "/.kube/config", "/.docker/config.json", "/docker-compose.yml",
            "/.circleci/config.yml", "/.github/workflows/",
            # Generic Backups/Secrets
            "/config.old", "/backup.sql", "/db.sql", "/dump.sql", "/temp/", "/tmp/",
            "/.bash_history", "/.zsh_history"
        ]
        
        intelligence_file = os.path.join(temp_dir, "discovered_intelligence.txt")
        with open(intelligence_file, "a", encoding="utf-8") as intel:
            intel.write(f"--- AGGRESSIVE CRAWL INTELLIGENCE FOR {url} ---\n\n")

        for f_path in fuzz_list:
            try:
                f_url = urljoin(url, f_path)
                f_resp = session.get(f_url, timeout=3, verify=False, allow_redirects=False)
                if f_resp.status_code in [200, 403]: # 403 might indicate existence
                    fname = f_path.lstrip("/").replace("/", "_") or "root"
                    with open(os.path.join(temp_dir, f"fuzz_{fname}.txt"), "w", encoding="utf-8", errors="ignore") as f:
                        f.write(f"URL: {f_url}\nStatus: {f_resp.status_code}\n\n{f_resp.text[:5000]}")
                    files_saved += 1
                    with open(intelligence_file, "a", encoding="utf-8") as intel:
                        intel.write(f"[FOUND] {f_path} (Status: {f_resp.status_code})\n")
                    
                    # Emit finding for UI visibility
                    severity = "High" if f_path in [".env", ".git/config", ".ssh", "/config.php.bak"] else "Medium"
                    events.emit_finding({
                        "type": "Sensitive File Discovery",
                        "severity": severity,
                        "description": f"Accessible sensitive file found at {f_path}. This file often contains credentials, configuration secrets, or system-level metadata that should not be public.",
                        "evidence": f"URL: {f_url}\nStatus: {f_resp.status_code}",
                        "mitigation": "Restrict access to this file via web server configuration (e.g., .htaccess, Nginx location block) or move the file out of the web root.",
                        "thought": "Proactive fuzzing discovered a sensitive path that is responding with 200/403, indicating it exists on the server.",
                        "exploit_details": f"An attacker can directly request '{f_url}' to potentially download sensitive configuration, environment variables, or backup data. This often leads to full database compromise or administrative takeover.",
                        "confidence": 95,
                        "waf_status": "NOT DETECTED"
                    })
            except: pass

        # 2. Main BFS Crawl
        while queue and files_saved < MAX_PAGES:
            curr_url, depth = queue.popleft()
            curr_url = curr_url.split("#")[0]
            if curr_url in visited: continue
            visited.add(curr_url)

            try:
                resp = session.get(curr_url, timeout=10, verify=False)
                if resp.status_code != 200: continue
                
                # Tech Identification
                headers_str = str(resp.headers).lower()
                body_str = resp.text[:10000].lower()
                
                techs = []
                if "wp-content" in body_str or "wordpress" in headers_str: techs.append("WordPress")
                if "shopify" in body_str or "shopify" in headers_str: techs.append("Shopify")
                if "react" in body_str or "_next" in body_str: techs.append("React/Next.js")
                if "angular" in body_str: techs.append("Angular")
                if "laravel" in body_str or "laravel_session" in headers_str: techs.append("Laravel")
                
                if techs:
                    with open(intelligence_file, "a", encoding="utf-8") as intel:
                        intel.write(f"\n[TECH DETECTED] {curr_url}: {', '.join(techs)}\n")
                    # Emit finding for UI visibility
                    events.emit_finding({
                        "type": "Technology Fingerprint",
                        "severity": "Info",
                        "description": f"Detected {', '.join(techs)} on {curr_url}. This reveals the underlying server-side stack which can be used to narrow down potential vulnerabilities.",
                        "evidence": f"Signatures found in headers or HTML body at {curr_url}",
                        "mitigation": "Disable or customize server headers (e.g., 'X-Powered-By') and remove version strings from public HTML/JS to hinder automated reconnaissance.",
                        "thought": "Pattern matching on response headers and body content identified the specific framework or CMS being used.",
                        "exploit_details": f"Knowing that the target uses {', '.join(techs)} allows an attacker to search for specific CVEs, known exploits, or common misconfigurations (like default admin paths or known vulnerabilities in specific versions).",
                        "confidence": 100,
                        "waf_status": "NOT DETECTED"
                    })
                
                # Save the file
                parsed_curr = urlparse(curr_url)
                path = parsed_curr.path.strip("/") or "index.html"
                if not path.endswith((".html", ".js", ".css", ".php", ".aspx")):
                    if "." not in os.path.basename(path):
                        path += ".html"
                
                safe_path = re.sub(r'[^\w\.-]', '_', path)
                full_path = os.path.join(temp_dir, safe_path)
                
                os.makedirs(os.path.dirname(full_path), exist_ok=True)
                with open(full_path, "w", encoding="utf-8", errors="ignore") as f:
                    f.write(resp.text)
                files_saved += 1

                # Extract intelligence if HTML
                if "text/html" in resp.headers.get("content-type", "") and _BS4_AVAILABLE:
                    soup = BeautifulSoup(resp.text, 'html.parser')
                    
                    # 3. EXTRACTION: Find hidden inputs and comments
                    hidden_inputs = soup.find_all("input", type="hidden")
                    comments = soup.find_all(string=lambda text: isinstance(text, Comment))
                    
                    if hidden_inputs or comments:
                        try:
                            with open(intelligence_file, "a", encoding="utf-8") as intel:
                                intel.write(f"\n[HTML INTEL] {curr_url}\n")
                                for hi in hidden_inputs:
                                    intel.write(f"- Hidden Input: {hi.get('name')}={hi.get('value')}\n")
                                for comm in comments:
                                    if len(str(comm).strip()) > 5:
                                        intel.write(f"- Comment: {str(comm).strip()}\n")
                        except: pass

                    # Find more pages and subdomains
                    if depth < MAX_DEPTH:
                        for a in soup.find_all('a', href=True):
                            link = urljoin(curr_url, a['href'])
                            parsed_link = urlparse(link)
                            if parsed_link.netloc == domain:
                                queue.append((link, depth + 1))
                            elif parsed_link.netloc.endswith(domain) and parsed_link.netloc != domain:
                                discovered_subdomains.add(parsed_link.netloc)
                    
                    # Find and save CSS (and scan for assets)
                    for css in soup.find_all('link', rel="stylesheet", href=True):
                        css_url = urljoin(curr_url, css['href'])
                        try:
                            c_resp = session.get(css_url, timeout=5, verify=False)
                            if c_resp.status_code == 200:
                                css_assets = re.findall(r'url\(["\']?(.*?)["\']?\)', c_resp.text)
                                if css_assets:
                                    with open(intelligence_file, "a", encoding="utf-8") as intel:
                                        intel.write(f"- CSS Assets in {css_url}: {len(css_assets)} found\n")
                        except: continue

                    # Find and save JS
                    for script in soup.find_all('script', src=True):
                        js_url = urljoin(curr_url, script['src'])
                        if urlparse(js_url).netloc == domain or "cdn" in js_url:
                            try:
                                js_resp = session.get(js_url, timeout=5, verify=False)
                                if js_resp.status_code == 200:
                                    js_fname = re.sub(r'[^\w\.-]', '_', os.path.basename(urlparse(js_url).path)) or f"script_{files_saved}.js"
                                    if not js_fname.endswith(".js"): js_fname += ".js"
                                    
                                    js_content = js_resp.text
                                    
                                    # 4. EXTRACTION: Find API endpoints and subdomains in JS
                                    endpoints = re.findall(r'["\'](/(?:api|v1|v2|graphql|v3|webhooks|rest)/[\w/-]+)["\']', js_content)
                                    js_subs = re.findall(r'https?://([\w.-]+\.' + re.escape(domain) + r')', js_content)
                                    
                                    if endpoints or js_subs:
                                        js_content += f"\n\n/* [INTELLIGENCE: DISCOVERED DATA] */\n"
                                        for ep in set(endpoints):
                                            js_content += f"// Potential Endpoint: {ep}\n"
                                        for s in set(js_subs):
                                            discovered_subdomains.add(s)
                                            js_content += f"// Potential Subdomain: {s}\n"
                                    
                                    with open(os.path.join(temp_dir, js_fname), "w", encoding="utf-8", errors="ignore") as f:
                                        f.write(js_content)
                                    files_saved += 1

                                    # 5. SPA SPECIAL: Check for Source Maps (.js.map)
                                    try:
                                        map_url = js_url + ".map"
                                        map_resp = session.get(map_url, timeout=3, verify=False)
                                        if map_resp.status_code == 200:
                                            with open(os.path.join(temp_dir, js_fname + ".map"), "w", encoding="utf-8", errors="ignore") as f:
                                                f.write(map_resp.text)
                                            with open(intelligence_file, "a", encoding="utf-8") as intel:
                                                intel.write(f"[SPA INTEL] Found Source Map: {map_url} (discloses original code)\n")
                                            files_saved += 1
                                    except: pass
                            except: continue
            except: 
                continue

        # Finalize Subdomain list
        if discovered_subdomains:
            try:
                with open(intelligence_file, "a", encoding="utf-8") as intel:
                    intel.write(f"\n[DISCOVERED SUBDOMAINS]\n")
                    for s in discovered_subdomains:
                        intel.write(f"- {s}\n")
            except: pass
                
        return {
            "success": True, 
            "folder": os.path.abspath(temp_dir),
            "files_found": files_saved,
            "message": "Extreme aggressive crawl complete. Check 'discovered_intelligence.txt' for findings."
        }
    except Exception as e:
        print(f"ERROR during aggressive crawl: {e}")
        return {"success": False, "error": str(e)}

# Detect static files path — mount happens AFTER all routes are defined (at end of file)
# Try multiple paths for robustness (local dev, installed package, relative to CWD)
possible_paths = [
    Path(__file__).resolve().parent / "web" / "dist", # Local dev relative to server.py
    Path.cwd() / "testinggpt" / "interface" / "web" / "dist", # Relative to project root
    Path.cwd() / "testGPT" / "testinggpt" / "interface" / "web" / "dist", # Relative to workspace root
    Path.cwd() / "web" / "dist", # If running from interface folder
    Path.cwd() / "dist", # If running from web folder
]

static_path = None
for p in possible_paths:
    if p.exists() and (p / "index.html").exists():
        static_path = p
        break

if static_path:
    print(f"DEBUG: Serving frontend from confirmed path: {static_path}")
else:
    # Diagnostic search for troubleshooting
    search_msg = "\n".join([f"- {p} (exists: {p.exists()})" for p in possible_paths])
    print(f"DEBUG: Frontend NOT found in common locations:\n{search_msg}")

from fastapi import HTTPException
from starlette.exceptions import HTTPException as StarletteHTTPException

# SPA Support: Serve index.html for 404 errors (except for /api paths and static assets)
@app.exception_handler(StarletteHTTPException)
async def spa_exception_handler(request: Request, exc: StarletteHTTPException):
    path = request.url.path
    # Only serve index.html for extension-less routes that aren't API calls
    # This prevents serving HTML for missing .js/.css files which causes infinite reloads
    is_asset = "." in path.split("/")[-1]
    if exc.status_code == 404 and not path.startswith("/api") and not is_asset:
        if static_path.exists() and (static_path / "index.html").exists():
            return FileResponse(static_path / "index.html")
    return await http_exception_handler(request, exc)

from fastapi.exception_handlers import http_exception_handler

@app.post("/api/upload-session")
async def upload_session(request: Request):
    """Upload a previously downloaded report to restore session state and findings."""
    data = await request.json()
    report_text = data.get("text", "")
    session_type = data.get("session_type", "pentest") # pentest, backend, audit
    
    if not report_text:
        return {"success": False, "error": "Report text is empty"}

    # 1. Basic Parsing using Regex
    target_match = re.search(r"OPERATIONAL TARGET:\s*(.+)", report_text)
    if not target_match:
        # Fallback for older report format "TARGET: ..."
        target_match = re.search(r"TARGET:\s*(.+)", report_text)
        
    model_match = re.search(r"MODEL:\s*(.+)", report_text)
    
    target = target_match.group(1).strip() if target_match else "Unknown Target"
    model = model_match.group(1).strip() if model_match else None
    
    # 2. Parse Findings (Vulnerability Ledger)
    findings = []
    # Look for the start of the ledger and end of it
    ledger_start = report_text.find("VULNERABILITY LEDGER")
    if ledger_start == -1:
        ledger_start = report_text.find("VULNERABILITY LEDGER") # Case sensitive check
        
    log_start = report_text.find("TACTICAL OPERATION LOG")
    
    if ledger_start != -1:
        ledger_text = report_text[ledger_start : log_start if log_start != -1 else len(report_text)]
        # Finding sections start with "1. [SEVERITY]" or just "[SEVERITY]"
        finding_blocks = re.split(r"\n(?=(?:\d+\.\s*)?\[(?:CRITICAL|HIGH|MEDIUM|LOW|INFO)\])", ledger_text)
        for block in finding_blocks:
            line1 = block.strip().split("\n")[0]
            m = re.search(r"\[(CRITICAL|HIGH|MEDIUM|LOW|INFO)\]\s*(.+)", line1)
            if m:
                severity = m.group(1)
                title = m.group(2)
                
                # Extract description and details
                desc_match = re.search(r"Description:\s*(.*?)(?=\n\w+:|$)", block, re.DOTALL)
                evidence_match = re.search(r"Evidence:\s*(.*?)(?=\n\w+:|$)", block, re.DOTALL)
                mitigation_match = re.search(r"Mitigation:\s*(.*?)(?=\n\w+:|$)", block, re.DOTALL)
                thought_match = re.search(r"Thought:\s*(.*?)(?=\n\w+:|$)", block, re.DOTALL)
                exploit_match = re.search(r"Exploit Details:\s*(.*?)(?=\n\w+:|$)", block, re.DOTALL)
                conf_match = re.search(r"Confidence:\s*(\d+)%", block)
                waf_match = re.search(r"WAF Status:\s*(.*)", block)

                finding = {
                    "type": title,
                    "severity": severity,
                    "description": desc_match.group(1).strip() if desc_match else "",
                    "evidence": evidence_match.group(1).strip() if evidence_match else "",
                    "mitigation": mitigation_match.group(1).strip() if mitigation_match else "",
                    "thought": thought_match.group(1).strip() if thought_match else "",
                    "exploit_details": exploit_match.group(1).strip() if exploit_match else "",
                    "confidence": int(conf_match.group(1)) if conf_match else 100,
                    "waf_status": waf_match.group(1).strip() if waf_match else "NOT DETECTED",
                    "id": f"uploaded_{int(time.time())}_{len(findings)}"
                }
                findings.append(finding)

    # 3. Extract Tactical History & Categorize
    success_recon = []
    failed_vectors = []
    key_discoveries = []
    
    if log_start != -1:
        log_text = report_text[log_start:]
        # Extract actions to analyze state
        actions = re.findall(r"\[\d{2}:\d{2}:\d{2}\]\s*(TOOL EXEC|DISCOVERY|SYSTEM):\s*(.*)", log_text)
        
        # Analyze last 40 actions for broader context
        for i, (act_type, act_desc) in enumerate(actions[-40:]):
            desc_lower = act_desc.lower()
            
            # Identify Success (Finding ports/services)
            if "port" in desc_lower and "open" in desc_lower:
                success_recon.append(act_desc)
            elif "discovered" in desc_lower or "found" in desc_lower:
                key_discoveries.append(act_desc)
                
            # Identify Failures (Errors or no output)
            if "error" in desc_lower or "failed" in desc_lower or "no result" in desc_lower or "empty" in desc_lower:
                # Look at the command that caused the failure (likely the previous tool exec)
                cmd_context = "Unknown command"
                if i > 0:
                    prev_type, prev_desc = actions[max(0, i-1)]
                    if prev_type == "TOOL EXEC":
                        cmd_context = prev_desc
                failed_vectors.append(f"{cmd_context} -> {act_desc[:100]}")

    # 4. Ingest findings into current audit_results for UI
    global audit_results
    audit_results = []
    for f in findings:
        audit_results.append({
            "type": "ISSUE",
            "severity": f["severity"],
            "title": f["type"],
            "description": f["description"],
            "evidence": f["evidence"],
            "mitigation": f["mitigation"],
            "thought": f["thought"],
            "exploit_details": f["exploit_details"],
            "confidence": f["confidence"],
            "waf_status": f["waf_status"],
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
        })

    # 5. Build Structured History Injection Instructions
    history_instruction = f"\n\n[!!! MISSION HISTORY RESTORED !!!]\n"
    history_instruction += f"Resuming session for: {target}\n"
    
    if findings:
        history_instruction += f"\n[!! CONFIRMED VULNERABILITIES !!]\n"
        for f in findings:
            history_instruction += f"- [{f['severity']}] {f['type']}: {f['description'][:100]}...\n"
            
    if success_recon:
        history_instruction += f"\n[!! SUCCESSFUL RECONNAISSANCE !!]\n"
        for res in set(success_recon[-10:]): # Keep unique recent ones
            history_instruction += f"- {res[:200]}\n"
            
    if key_discoveries:
        history_instruction += f"\n[!! KEY DISCOVERIES !!]\n"
        for disc in set(key_discoveries[-10:]):
            history_instruction += f"- {disc[:200]}\n"
            
    if failed_vectors:
        history_instruction += f"\n[!! FAILED ATTACK VECTORS - DO NOT REPEAT !!]\n"
        for fail in set(failed_vectors[-10:]):
            history_instruction += f"- {fail}\n"
    
    history_instruction += "\n[MANDATORY RESUMPTION PROTOCOL]\n"
    history_instruction += "1. INTERNALIZE: Read the 'FAILED ATTACK VECTORS' and ENSURE your current plan does NOT repeat them.\n"
    history_instruction += "2. PRIORITIZE: Take the 'CONFIRMED VULNERABILITIES' and perform an AGGRESSIVE DEEP DIVE to escalate them.\n"
    history_instruction += "3. ADAPT: Use 'SUCCESSFUL RECONNAISSANCE' to identify new targets or forgotten services.\n"
    history_instruction += "4. NEVER START FROM SCRATCH. Your first <thinking> block MUST acknowledge these past findings and failures."

    # 6. Session Type Specific Logic
    if session_type == "backend":
        # Inject Backend Intel instructions
        history_instruction += """
\n\n[BACKEND INTELLIGENCE MISSION DETECTED]
MANDATORY: REPORT ALL DISCOVERIES IMMEDIATELY.
Your goal is to map the ENTIRE backend architecture. Every time you identify a single piece of information, you MUST report it as a FINDING.

Use these types precisely:
- "TECH_STACK": For server OS, web servers (Nginx/Apache), languages (PHP/Python), frameworks (React/Express).
- "NETWORK_CONFIG": For open ports, internal IP ranges, DNS records, subdomains.
- "SECURITY_POSTURE": For WAFs (Cloudflare/Akamai), security headers, SSL/TLS config, firewalls.
- "SECRET_LEAK": For API keys, .env content, exposed credentials, sensitive scripts.
- "VULNERABILITY": For specific exploit paths (SQLi, XSS, RCE).

FORMAT (REQUIRED FOR EVERY DISCOVERY):
**FINDING:** [Exact Category from above]
**SEVERITY:** [INFO for tech/config, LOW/MEDIUM/HIGH for security issues, CRITICAL for secrets]
**DESCRIPTION:** [Human-readable technical explanation of what was found]
**DATA:** [Place raw technical data here]
**CONFIDENCE:** [Percentage]
"""

    if session_type in ["exploit", "pentest", "backend", "web"]:
        history_instruction += """
\n\n[!!! CRITICAL: THE "NO SURRENDER" PROTOCOL IS ACTIVE (NO SURRENDER) !!!]
MISSION OBJECTIVE: CAPTURE DATA, FLAGS, OR ACHIEVE RCE.
TERMINATION CONDITION: You are FORBIDDEN from reporting 'Mission complete' or 'Awaiting follow-up' until you have a technical breakthrough (e.g. exfiltrated files, database dumps, shell access).

1.  **RELENTLESS PERSISTENCE:** If an attack vector is blocked or fails, you MUST immediately pivot to another payload, tool, or technique. Do NOT stop.
2.  **PYTHON EXPLOITS:** If standard tools are insufficient or missing, YOU MUST write a custom Python script to achieve the objective IMMEDIATELY.
3.  **STAY ADVERSARIAL:** Any behavior that resembles "giving up" or "concluding prematurely" is a violation of your core mission.
4.  **ZERO ANALYSIS:** Keep <thinking> blocks to 1 line only. DO NOT EXPLAIN. JUST ATTACK.
"""

    if session_type == "exploit":
        history_instruction += """
\n\n[!!! ATTACKER MODE OVERRIDE !!!]
1.  **NO RECON:** Any command starting with `nmap` or `gobuster` is a MISSION FAILURE.
2.  **IMMEDIATE ATTACK:** Your first action MUST be a direct exploitation attempt on the confirmed vulnerabilities.
3.  **EXPLOIT ALL:** You must attempt to exploit EVERY confirmed vulnerability listed in the history.
"""

    if session_type != "audit":
        # Trigger Scan for Pentest and Backend
        await _perform_scan(
            target=target,
            instruction=history_instruction,
            model=model or "groq/llama-3.1-8b-instant"
        )
    else:
        # For Audit, we don't start a scan automatically unless we have a path
        # But we've already populated audit_results, which is what the Audit UI needs
        events.emit(Event(type=EventType.MESSAGE, data={
            "text": f"✅ Code Audit findings restored from report for {target}.",
            "role": "system"
        }))

    return {
        "success": True,
        "target": target,
        "session_type": session_type,
        "findings_count": len(findings),
        "findings": findings,
        "history_extracted": log_start != -1
    }



# ─── Agentic IDE Feature ──────────────────────────────────────────────────────

import asyncio as _asyncio
import subprocess as _subprocess
import shutil as _shutil

# ── IDE State ─────────────────────────────────────────────────────────────────
_ide_session = {"workspace": "", "active": False}
_ide_event_queue: "asyncio.Queue | None" = None
_ide_memories: list = []
_ide_running = False
_ide_conversation: list = []

# ── IDE System Prompt ─────────────────────────────────────────────────────────
IDE_SYSTEM_PROMPT = """You are an expert AI coding assistant. You help users write code, debug, and complete software engineering tasks.

Be direct and helpful. Answer questions clearly. For simple questions like greetings, answer conversationally — no need to use tools.

When you need to interact with files or run commands, use tools in this format:
<tool_call>
{"tool": "shell", "command": "<command>", "cwd": "<working_dir>"}
</tool_call>
<tool_call>
{"tool": "read_file", "path": "<file_path>"}
</tool_call>
<tool_call>
{"tool": "write_file", "path": "<file_path>", "content": "<full_content>"}
</tool_call>
<tool_call>
{"tool": "list_dir", "path": "<dir_path>"}
</tool_call>
<tool_call>
{"tool": "grep_search", "query": "<search_term>", "path": "<dir_path>"}
</tool_call>
<tool_call>
{"tool": "replace_file_content", "path": "<file_path>", "old": "<old_text>", "new": "<new_text>"}
</tool_call>

Rules:
- For conversational messages ("hello", "how are you", questions), just reply in plain text. No tools needed.
- For coding tasks, use tools to read files first, then make changes.
- After completing a task, write a summary of what you did.
- End complex multi-step tasks with ---DONE---
"""

# ── Model candidates ──────────────────────────────────────────────────────────
def _ide_model_candidates() -> list:
    """Return ordered list of (model_str, kwargs) for litellm.acompletion.

    NVIDIA-only priority:
    1. nvidia/nemotron-3-ultra-550b-a55b  (NVIDIA_NEMOTRON_KEY)
    2. deepseek-ai/deepseek-v3-0324       (NVIDIA_DEEPSEEK_KEY)
    """
    import os

    nemotron_key = os.getenv("NVIDIA_NEMOTRON_KEY", "")
    deepseek_key = os.getenv("NVIDIA_DEEPSEEK_KEY", "")
    nvidia_base = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")

    candidates = []

    # ── 1. NVIDIA Nemotron-Ultra-550B (User Requested) ────────────────────────
    if nemotron_key:
        candidates.append((
            "openai/nvidia/nemotron-3-ultra-550b-a55b",
            {
                "api_key": nemotron_key,
                "api_base": nvidia_base,
                "temperature": 0.2,
                "max_tokens": 4096,
            }
        ))

    # ── 2. NVIDIA DeepSeek-V3 ─────────────────────────────────────────────────
    if deepseek_key:
        candidates.append((
            "openai/deepseek-ai/deepseek-v3",
            {
                "api_key": deepseek_key,
                "api_base": nvidia_base,
                "temperature": 0.2,
                "max_tokens": 4096,
            }
        ))

    if not candidates:
        raise RuntimeError(
            "No NVIDIA API keys found. Set NVIDIA_NEMOTRON_KEY and/or "
            "NVIDIA_DEEPSEEK_KEY in your .env file."
        )

    return candidates

# ── Format model name for display ─────────────────────────────────────────────
def _ide_format_model_name(model_str: str) -> str:
    """Convert raw model string to clean display name."""
    s = model_str.lower()
    if "nemotron-super" in s or "nemotron-ultra" in s or "nemotron" in s:
        return "NEMOTRON"
    if "deepseek-v3" in s:
        return "DEEPSEEK-V3"
    if "deepseek" in s:
        return "DEEPSEEK"
    if "gemini-2.0-flash" in s:
        return "GEMINI-FLASH"
    if "gemini" in s:
        return "GEMINI"
    if "llama-3.3" in s:
        return "LLAMA-3.3"
    if "llama-3.1" in s or "llama" in s:
        return "LLAMA-3.1"
    if "gpt-4" in s:
        return "GPT-4"
    if "claude" in s:
        return "CLAUDE"
    # last segment after /
    parts = model_str.split("/")
    return parts[-1].upper()[:20]

# ── Push event to SSE queue ────────────────────────────────────────────────────
def _ide_push_event(etype: str, data: dict):
    import time
    global _ide_event_queue
    if _ide_event_queue is not None:
        ev = {"type": etype, "data": data, "timestamp": _time_iso()}
        try:
            _ide_event_queue.put_nowait(ev)
        except Exception:
            pass

def _time_iso():
    import datetime
    return datetime.datetime.utcnow().isoformat() + "Z"

# ── Tool executor ─────────────────────────────────────────────────────────────
async def _ide_execute_tool(tool_call: dict, workspace: str) -> dict:
    """Execute a tool call and return the result dict."""
    tool = tool_call.get("tool", "")
    result = {"tool": tool, "success": False}

    try:
        if tool == "shell":
            cmd = tool_call.get("command", "")
            cwd = tool_call.get("cwd", workspace) or workspace
            _ide_push_event("TOOL_START", {"tool": "shell", "command": cmd})
            proc = await asyncio.create_subprocess_shell(
                cmd, cwd=cwd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.STDOUT,
                limit=512*1024
            )
            try:
                stdout, _ = await asyncio.wait_for(proc.communicate(), timeout=60.0)
            except asyncio.TimeoutError:
                proc.kill()
                stdout = b"[TIMEOUT after 60s]"
                proc.returncode = -1
            output = stdout.decode("utf-8", errors="replace")[:8000]
            result = {"tool": "shell", "command": cmd, "output": output, "returncode": proc.returncode or 0, "success": True}
            _ide_push_event("TOOL_RESULT", result)

        elif tool == "read_file":
            path = tool_call.get("path", "")
            _ide_push_event("TOOL_START", {"tool": "read_file", "path": path})
            try:
                with open(path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read(25000)
                truncated = len(content) == 25000
                if truncated:
                    content += "\n\n... [FILE TRUNCATED AT 25000 CHARS] ..."
                result = {"tool": "read_file", "path": path, "content": content, "truncated": truncated, "success": True}
            except FileNotFoundError:
                result = {"tool": "read_file", "path": path, "content": f"Error: file not found: {path}", "success": False}
            except Exception as ex:
                result = {"tool": "read_file", "path": path, "content": f"Error: {ex}", "success": False}
            _ide_push_event("TOOL_RESULT", result)

        elif tool == "write_file":
            path = tool_call.get("path", "")
            content = tool_call.get("content", "")
            _ide_push_event("TOOL_START", {"tool": "write_file", "path": path})
            try:
                os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
                with open(path, "w", encoding="utf-8") as f:
                    f.write(content)
                result = {"tool": "write_file", "path": path, "bytes": len(content.encode()), "success": True}
            except Exception as ex:
                result = {"tool": "write_file", "path": path, "output": f"Error: {ex}", "success": False}
            _ide_push_event("TOOL_RESULT", result)

        elif tool == "list_dir":
            path = tool_call.get("path", workspace)
            _ide_push_event("TOOL_START", {"tool": "list_dir", "path": path})
            try:
                items = []
                for name in sorted(os.listdir(path)):
                    full = os.path.join(path, name)
                    is_dir = os.path.isdir(full)
                    size = 0 if is_dir else os.path.getsize(full)
                    items.append({"name": name, "path": full, "isDir": is_dir, "size": size})
                result = {"tool": "list_dir", "path": path, "items": items[:100], "success": True}
            except Exception as ex:
                result = {"tool": "list_dir", "path": path, "items": [], "output": f"Error: {ex}", "success": False}
            _ide_push_event("TOOL_RESULT", result)

        elif tool == "grep_search":
            query = tool_call.get("query", "")
            path = tool_call.get("path", workspace)
            _ide_push_event("TOOL_START", {"tool": "grep_search", "query": query, "path": path})
            try:
                cmd = f'grep -rn "{query}" "{path}" --include="*.py" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" --include="*.html" --include="*.css" -l 2>/dev/null | head -20'
                proc = await asyncio.create_subprocess_shell(cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.DEVNULL)
                stdout, _ = await asyncio.wait_for(proc.communicate(), timeout=15.0)
                output = stdout.decode("utf-8", errors="replace")[:4000]
                result = {"tool": "grep_search", "query": query, "output": output, "success": True}
            except Exception as ex:
                result = {"tool": "grep_search", "query": query, "output": f"Error: {ex}", "success": False}
            _ide_push_event("TOOL_RESULT", result)

        elif tool == "replace_file_content":
            path = tool_call.get("path", "")
            old = tool_call.get("old", "")
            new = tool_call.get("new", "")
            _ide_push_event("TOOL_START", {"tool": "replace_file_content", "path": path})
            try:
                with open(path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                if old not in content:
                    result = {"tool": "replace_file_content", "path": path, "output": "Error: old string not found in file", "success": False}
                else:
                    new_content = content.replace(old, new, 1)
                    with open(path, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    result = {"tool": "replace_file_content", "path": path, "success": True}
            except Exception as ex:
                result = {"tool": "replace_file_content", "path": path, "output": f"Error: {ex}", "success": False}
            _ide_push_event("TOOL_RESULT", result)

        else:
            result = {"tool": tool, "output": f"Unknown tool: {tool}", "success": False}
            _ide_push_event("TOOL_RESULT", result)

    except Exception as ex:
        result = {"tool": tool, "output": f"Tool error: {ex}", "success": False}
        _ide_push_event("TOOL_RESULT", result)

    return result

# ── Agentic loop ──────────────────────────────────────────────────────────────
async def _ide_agentic_loop(conversation_history: list, workspace: str):
    """Main agentic loop: model → parse tool calls → execute → inject results → repeat."""
    global _ide_running, _ide_conversation

    import litellm
    import re as _re

    candidates = _ide_model_candidates()
    max_iterations = 20
    iteration = 0
    selected_model = ""

    while _ide_running and iteration < max_iterations:
        iteration += 1

        # ── Emit THINKING before every LLM call ───────────────────────────────
        _ide_push_event("THINKING", {"iteration": iteration})

        # ── Select model (try candidates in order) ────────────────────────────
        response_text = None
        used_model = None
        for model_str, model_kwargs in candidates:
            if not _ide_running:
                break
            try:
                # Announce which model we're using
                if selected_model != model_str:
                    selected_model = model_str
                    display_name = _ide_format_model_name(model_str)
                    _ide_push_event("MODEL_SELECTED", {"model": display_name, "raw": model_str})

                resp = await litellm.acompletion(
                    model=model_str,
                    messages=conversation_history,
                    stream=True,
                    num_retries=1,
                    timeout=120,
                    **model_kwargs
                )

                # ── Stream response ────────────────────────────────────────────
                accumulated = ""
                async for chunk in resp:
                    if not _ide_running:
                        break
                    delta = ""
                    try:
                        delta = chunk.choices[0].delta.content or ""
                    except Exception:
                        pass
                    accumulated += delta
                    if delta:
                        _ide_push_event("AI_MESSAGE_PARTIAL", {"content": accumulated})

                response_text = accumulated.strip()
                used_model = model_str
                break  # success — exit candidate loop

            except Exception as model_err:
                err_str = str(model_err)
                print(f"[IDE] Model {model_str} failed: {err_str[:300]}")
                _ide_push_event("AI_MESSAGE_PARTIAL", {"content": f"[{_ide_format_model_name(model_str)} failed, trying next…]"})
                continue  # try next candidate

        if not response_text:
            # All models failed
            _ide_push_event("AI_MESSAGE", {"content": "⚠️ All AI models failed to respond. Check your NVIDIA API keys in .env and network connection."})
            _ide_push_event("DONE", {"iterations": iteration, "reason": "all_models_failed"})
            _ide_running = False
            return

        # ── Save conversation ─────────────────────────────────────────────────
        conversation_history.append({"role": "assistant", "content": response_text})
        _ide_conversation = conversation_history

        # ── Parse tool calls ──────────────────────────────────────────────────
        tool_call_blocks = _re.findall(
            r'<tool_call>\s*([\s\S]*?)\s*</tool_call>',
            response_text
        )

        # ── No tool calls → direct answer, task complete ──────────────────────
        if not tool_call_blocks:
            _ide_push_event("AI_MESSAGE", {"content": response_text})
            _ide_push_event("DONE", {"iterations": iteration, "reason": "task_complete"})
            _ide_running = False
            return

        # ── Has tool calls — emit the reasoning message first ─────────────────
        # Show the text parts (excluding tool_call XML) as an AI message
        text_before_tools = _re.sub(r'<tool_call>[\s\S]*?</tool_call>', '', response_text).strip()
        if text_before_tools:
            _ide_push_event("AI_MESSAGE", {"content": text_before_tools})

        # ── Execute all tool calls in sequence ────────────────────────────────
        tool_results_for_history = []
        for tc_raw in tool_call_blocks:
            try:
                tc = json.loads(tc_raw)
            except Exception:
                try:
                    import ast as _ast
                    tc = _ast.literal_eval(tc_raw)
                except Exception:
                    _ide_push_event("TOOL_RESULT", {"tool": "unknown", "output": f"Could not parse tool call: {tc_raw[:200]}", "success": False})
                    continue

            result = await _ide_execute_tool(tc, workspace)
            tool_results_for_history.append(result)

        # ── Inject tool results back into conversation ─────────────────────────
        if tool_results_for_history:
            results_text = "[TOOL RESULTS]\n"
            for r in tool_results_for_history:
                t = r.get("tool", "unknown")
                if t == "shell":
                    results_text += f"\n<tool_result tool=\"shell\" command={json.dumps(r.get('command',''))} returncode={r.get('returncode',0)}>\n{r.get('output', '')}\n</tool_result>"
                elif t == "read_file":
                    results_text += f"\n<tool_result tool=\"read_file\" path={json.dumps(r.get('path',''))}>\n{r.get('content', '')}\n</tool_result>"
                elif t == "write_file":
                    status = "OK" if r.get("success") else r.get("output", "error")
                    results_text += f"\n<tool_result tool=\"write_file\" path={json.dumps(r.get('path',''))}>\n{status}\n</tool_result>"
                elif t == "list_dir":
                    items = r.get("items", [])
                    listing = "\n".join(f"{'[DIR]' if i['isDir'] else '[FILE]'} {i['name']}" for i in items[:50])
                    results_text += f"\n<tool_result tool=\"list_dir\" path={json.dumps(r.get('path',''))}>\n{listing}\n</tool_result>"
                elif t in ("grep_search", "replace_file_content"):
                    out = r.get("output", "OK" if r.get("success") else "error")
                    results_text += f"\n<tool_result tool={json.dumps(t)}>\n{out}\n</tool_result>"
                else:
                    results_text += f"\n<tool_result tool={json.dumps(t)}>\n{r.get('output', str(r))}\n</tool_result>"

            conversation_history.append({"role": "user", "content": results_text})
            _ide_conversation = conversation_history

    # ── Loop exhausted ────────────────────────────────────────────────────────
    if _ide_running:
        _ide_push_event("AI_MESSAGE", {"content": "Agent reached maximum iteration limit."})
    _ide_push_event("DONE", {"iterations": iteration, "reason": "max_iterations"})
    _ide_running = False


# ── IDE Endpoints ─────────────────────────────────────────────────────────────

@app.post("/api/ide/start")
async def ide_start(request: Request):
    """Initialize the IDE session with a workspace path."""
    global _ide_session, _ide_event_queue, _ide_memories, _ide_conversation, _ide_running
    data = await request.json()
    workspace = data.get("workspace", "").strip()
    if not workspace:
        workspace = "."

    _ide_session["workspace"] = workspace
    _ide_session["active"] = True
    _ide_running = False
    _ide_conversation = []
    
    if _ide_event_queue is None:
        _ide_event_queue = asyncio.Queue(maxsize=500)
    else:
        # Clear existing queue without replacing the object the SSE generator is listening to
        while not _ide_event_queue.empty():
            try:
                _ide_event_queue.get_nowait()
            except Exception:
                pass

    # Load persisted memories if they exist
    mem_file = os.path.join(os.path.dirname(__file__), ".ide_memory.json")
    try:
        with open(mem_file, "r") as f:
            _ide_memories = json.load(f)
    except Exception:
        _ide_memories = []

    _ide_push_event("SESSION_STARTED", {"workspace": workspace})
    return {"success": True, "workspace": workspace, "memories_loaded": len(_ide_memories)}


@app.post("/api/ide/prompt")
async def ide_prompt(request: Request):
    """Accept a user message and start the agentic loop."""
    global _ide_running, _ide_conversation, _ide_event_queue
    data = await request.json()
    message = data.get("message", "").strip()
    if not message:
        return {"success": False, "error": "Empty message"}

    if _ide_running:
        return {"success": False, "error": "Agent is already running"}

    workspace = _ide_session.get("workspace", ".")
    if _ide_event_queue is None:
        _ide_event_queue = asyncio.Queue(maxsize=500)

    # Emit USER_MESSAGE event so UI shows it immediately
    _ide_push_event("USER_MESSAGE", {"content": message})

    # Build messages with system prompt
    if not _ide_conversation:
        # Fresh conversation — add system prompt + workspace context
        mem_ctx = ""
        if _ide_memories:
            mem_lines = "\n".join(f"[{m.get('type','note')}] {m.get('content','')}" for m in _ide_memories[:20])
            mem_ctx = f"\n\nSAVED MEMORIES:\n{mem_lines}"
        _ide_conversation = [
            {"role": "system", "content": IDE_SYSTEM_PROMPT + mem_ctx},
            {"role": "user", "content": f"[WORKSPACE: {workspace}]\n\n{message}"}
        ]
    else:
        # Continue conversation
        _ide_conversation.append({"role": "user", "content": message})

    _ide_running = True

    async def run_loop():
        global _ide_running
        try:
            await _ide_agentic_loop(_ide_conversation, workspace)
        except Exception as e:
            import traceback
            tb = traceback.format_exc()
            print(f"[IDE LOOP ERROR] {e}\n{tb}")
            _ide_push_event("AI_MESSAGE", {"content": f"⚠️ Agent error: {e}\n\n```\n{tb[-600:]}\n```"})
            _ide_push_event("DONE", {"iterations": 0, "reason": "error"})
            _ide_running = False

    asyncio.create_task(run_loop())
    return {"success": True}


@app.get("/api/ide/events")
async def ide_events():
    """SSE stream for IDE events."""
    global _ide_event_queue
    if _ide_event_queue is None:
        _ide_event_queue = asyncio.Queue(maxsize=500)

    async def generator():
        # Heartbeat to confirm connection
        yield f"data: {json.dumps({'type': 'HEARTBEAT', 'data': {}, 'timestamp': _time_iso()})}\n\n"

        while True:
            try:
                ev = await asyncio.wait_for(_ide_event_queue.get(), timeout=15.0)
                yield f"data: {json.dumps(ev)}\n\n"
            except asyncio.TimeoutError:
                yield f"data: {json.dumps({'type': 'HEARTBEAT', 'data': {}, 'timestamp': _time_iso()})}\n\n"
            except (asyncio.CancelledError, GeneratorExit):
                break

    return StreamingResponse(generator(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@app.get("/api/ide/filesystem")
async def ide_filesystem(path: str = ""):
    """List directory contents for the file tree."""
    target = path or _ide_session.get("workspace", ".")
    SKIP = {'.git', '__pycache__', 'node_modules', '.venv', 'venv', 'dist', 'build', '.next', 'target', '.ruff_cache'}
    try:
        items = []
        for name in sorted(os.listdir(target)):
            if name in SKIP or name.startswith('.'): continue
            full = os.path.join(target, name)
            try:
                is_dir = os.path.isdir(full)
                size = 0 if is_dir else os.path.getsize(full)
                items.append({"name": name, "path": full, "isDir": is_dir, "size": size})
            except OSError:
                pass
        return {"success": True, "path": target, "items": items}
    except Exception as e:
        return {"success": False, "error": str(e), "items": []}


@app.get("/api/ide/read-file")
async def ide_read_file(path: str = ""):
    """Read a file and return its content (max 25000 chars)."""
    if not path:
        return {"success": False, "error": "No path provided", "content": ""}
    try:
        MAX = 25000
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read(MAX)
        truncated = len(content) == MAX
        if truncated:
            content += "\n\n... [FILE TRUNCATED — showing first 25,000 characters] ..."
        return {"success": True, "path": path, "content": content, "truncated": truncated}
    except FileNotFoundError:
        return {"success": False, "error": f"File not found: {path}", "content": ""}
    except Exception as e:
        return {"success": False, "error": str(e), "content": ""}


@app.post("/api/ide/run-command")
async def ide_run_command(request: Request):
    """Run a manual shell command from the terminal panel."""
    data = await request.json()
    command = data.get("command", "").strip()
    cwd = data.get("cwd") or _ide_session.get("workspace", ".")
    if not command:
        return {"success": False, "error": "No command"}
    try:
        proc = await asyncio.create_subprocess_shell(
            command, cwd=cwd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
            limit=256*1024
        )
        try:
            stdout, _ = await asyncio.wait_for(proc.communicate(), timeout=30.0)
        except asyncio.TimeoutError:
            proc.kill()
            stdout = b"[TIMEOUT after 30s]"
            proc.returncode = -1
        output = stdout.decode("utf-8", errors="replace")[:10000]
        return {"success": True, "output": output, "returncode": proc.returncode or 0}
    except Exception as e:
        return {"success": False, "error": str(e), "output": str(e), "returncode": 1}


@app.post("/api/ide/memories")
async def ide_add_memory(request: Request):
    """Add a memory entry."""
    global _ide_memories
    data = await request.json()
    mem = {"type": data.get("type", "note"), "content": data.get("content", "")}
    if not mem["content"]:
        return {"success": False, "error": "Empty content"}
    # Deduplicate
    if not any(m["content"] == mem["content"] for m in _ide_memories):
        _ide_memories.append(mem)
    # Persist
    mem_file = os.path.join(os.path.dirname(__file__), ".ide_memory.json")
    try:
        with open(mem_file, "w") as f:
            json.dump(_ide_memories, f, indent=2)
    except Exception:
        pass
    return {"success": True, "count": len(_ide_memories)}


@app.delete("/api/ide/memories")
async def ide_clear_memories():
    """Clear all memories."""
    global _ide_memories
    _ide_memories = []
    mem_file = os.path.join(os.path.dirname(__file__), ".ide_memory.json")
    try:
        with open(mem_file, "w") as f:
            json.dump([], f)
    except Exception:
        pass
    return {"success": True}


@app.post("/api/ide/stop")
async def ide_stop():
    """Stop the running agentic loop."""
    global _ide_running
    _ide_running = False
    _ide_push_event("STOPPED", {"reason": "user_stop"})
    return {"success": True}


# ─── APK Reverse Engineering Feature ─────────────────────────────────────────

@app.post("/api/analyze-apk")
async def analyze_apk(file: UploadFile = File(...)):
    """Upload and perform deep analysis on an APK file."""
    if not file.filename.endswith(".apk"):
        return {"success": False, "error": "Only .apk files are supported"}
    
    # Save to temp file
    temp_dir = tempfile.gettempdir()
    apk_path = os.path.join(temp_dir, f"analyze_{int(time.time())}_{file.filename}")
    
    try:
        with open(apk_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        
        # Get tool from registry
        from testinggpt.tools.registry import get_registry
        registry = get_registry()
        apk_tool = registry.get("apk_analyzer")
        
        if not apk_tool:
            return {"success": False, "error": "APK Analyzer tool not found in registry"}
            
        # Run analysis
        result = await apk_tool.execute(apk_path=apk_path)
        
        # Clean up
        if os.path.exists(apk_path):
            os.remove(apk_path)
            
        return result
        
    except Exception as e:
        if os.path.exists(apk_path):
            os.remove(apk_path)
        return {"success": False, "error": str(e)}

@app.post("/api/apk/pull-data")
async def pull_apk_data(request: Request):
    """Attempt to pull app data from a connected device via ADB."""
    data = await request.json()
    package_name = data.get("package_name")
    
    if not package_name:
        return {"success": False, "error": "Package name is required"}
        
    try:
        # Check if adb is available
        import subprocess
        proc = subprocess.run(["adb", "devices"], capture_output=True, text=True)
        if "device\n" not in proc.stdout:
            return {"success": False, "error": "No Android device connected via ADB"}
            
        # Try to pull data (requires root usually, but we'll provide the instructions anyway)
        # For the dashboard, we'll just emit the command and instructions
        events.emit(Event(type=EventType.MESSAGE, data={
            "text": f"📡 Requesting ADB data pull for {package_name}...",
            "role": "system"
        }))
        
        output_dir = os.path.join(tempfile.gettempdir(), f"data_{package_name}_{int(time.time())}")
        os.makedirs(output_dir, exist_ok=True)
        
        # The tool doesn't actually pull everything yet, but it returns the command
        cmd = f"adb shell su -c 'cp -r /data/data/{package_name} /sdcard/ && chmod -R 777 /sdcard/{package_name}'"
        
        events.emit(Event(type=EventType.MESSAGE, data={
            "text": f"⚠️ ADB pull requires root on the device. Execute manually if automation fails:\n`{cmd}`\nThen: `adb pull /sdcard/{package_name} {output_dir}`",
            "role": "system"
        }))
        
        return {
            "success": True, 
            "message": "ADB instructions emitted to log",
            "command": cmd,
            "local_dir": output_dir
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}

# ============================================================================
# IMPORTANT: Mount static files LAST so all /api/* routes take priority.
# StaticFiles mounted at "/" is a catch-all — anything before it wins.
# ============================================================================
if static_path:
    app.mount("/", StaticFiles(directory=str(static_path), html=True), name="static")
else:
    @app.get("/")
    async def root():
        return {
            "message": "testinggpt Web API is running. Frontend not built yet.",
            "paths_searched": [str(p) for p in possible_paths],
            "tip": "Run 'npm run build' in the web interface folder or check your PYTHONPATH."
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8085)
