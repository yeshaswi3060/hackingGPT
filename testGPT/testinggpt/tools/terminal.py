"""Terminal execution tool for testinggpt — with OS-aware command mapping, auto-install, and streaming."""

import asyncio
import os
import re
import shutil
import time
import tempfile
from typing import Any

from testinggpt.tools.base import BaseTool
from testinggpt.core.events import Event, EventBus, EventType


# ─── OS-Aware Command Translation ───────────────────────────────────────────

LINUX_TO_WINDOWS = {
    "cat": "type",
    "ls": "dir",
    "grep": "findstr",
    "wget": "curl.exe -O",
    "ifconfig": "ipconfig",
    "which": "where",
    "rm": "del",
    "cp": "copy",
    "mv": "move",
    "touch": "New-Item",
    "chmod": "icacls",
    "uname": "systeminfo",
    "pwd": "cd",
    "head": "more",
    "tail": "Get-Content -Tail 20",
    "wc": "Measure-Object -Line",
    "find": "Get-ChildItem -Recurse",
    "sed": "powershell -Command (Get-Content",
    "awk": "powershell -Command",
}

WINDOWS_TO_LINUX = {
    "type": "cat",
    "dir": "ls",
    "findstr": "grep",
    "ipconfig": "ifconfig",
    "where": "which",
    "del": "rm",
    "copy": "cp",
    "move": "mv",
    "systeminfo": "uname -a",
    "cls": "clear",
}

# ─── Auto-Install Map ───────────────────────────────────────────────────────

INSTALL_MAP = {
    # ── Reconnaissance ──
    "nmap":        {"windows": "choco install nmap -y",       "linux": "sudo apt install -y nmap"},
    "masscan":     {"windows": "choco install masscan -y",    "linux": "sudo apt install -y masscan"},
    "whois":       {"windows": "choco install whois -y",      "linux": "sudo apt install -y whois"},
    "dig":         {"windows": "choco install bind-toolsonly -y", "linux": "sudo apt install -y dnsutils"},
    "dnsenum":     {"linux": "sudo apt install -y dnsenum"},
    "dnsrecon":    {"all": "pip install dnsrecon"},
    "subfinder":   {"all": "go install github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest"},
    "amass":       {"linux": "sudo apt install -y amass"},
    "theharvester": {"all": "pip install theHarvester"},
    "wafw00f":     {"all": "pip install wafw00f"},
    "whatweb":     {"linux": "sudo apt install -y whatweb"},
    "wappalyzer":  {"all": "pip install python-Wappalyzer"},
    
    # ── Web Scanning & Fuzzing ──
    "gobuster":    {"windows": "choco install gobuster -y",   "linux": "sudo apt install -y gobuster"},
    "ffuf":        {"windows": "choco install ffuf -y",       "linux": "sudo apt install -y ffuf"},
    "feroxbuster": {"windows": "choco install feroxbuster -y","linux": "sudo apt install -y feroxbuster"},
    "dirb":        {"linux": "sudo apt install -y dirb"},
    "dirsearch":   {"all": "pip install dirsearch"},
    "wfuzz":       {"all": "pip install wfuzz"},
    "nikto":       {"linux": "sudo apt install -y nikto"},
    "nuclei":      {"all": "go install github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest"},
    "httpx":       {"all": "go install github.com/projectdiscovery/httpx/cmd/httpx@latest"},
    "wapiti":      {"all": "pip install wapiti3"},
    "arjun":       {"all": "pip install arjun"},
    
    # ── SQL Injection & XSS ──
    "sqlmap":      {"all": "pip install sqlmap"},
    "xsstrike":    {"all": "pip install xsstrike"},
    "dalfox":      {"all": "go install github.com/hahwul/dalfox/v2@latest"},
    "nosqlmap":    {"all": "pip install nosqlmap"},
    
    # ── Exploitation ──
    "searchsploit": {"linux": "sudo apt install -y exploitdb"},
    "hydra":       {"windows": "choco install thc-hydra -y",  "linux": "sudo apt install -y hydra"},
    "medusa":      {"linux": "sudo apt install -y medusa"},
    "netcat":      {"windows": "choco install nmap -y",       "linux": "sudo apt install -y ncat"},
    "socat":       {"linux": "sudo apt install -y socat"},
    "chisel":      {"all": "go install github.com/jpillora/chisel@latest"},
    
    # ── Password Cracking ──
    "john":        {"windows": "choco install john -y",       "linux": "sudo apt install -y john"},
    "hashcat":     {"windows": "choco install hashcat -y",    "linux": "sudo apt install -y hashcat"},
    "hashid":      {"all": "pip install hashid"},
    "hash-identifier": {"all": "pip install hash-identifier"},
    
    # ── Network & Protocol ──
    "sslscan":     {"linux": "sudo apt install -y sslscan"},
    "testssl.sh":  {"all": "pip install testssl"},
    "enum4linux":  {"linux": "sudo apt install -y enum4linux"},
    "smbclient":   {"linux": "sudo apt install -y smbclient"},
    "snmpwalk":    {"linux": "sudo apt install -y snmp"},
    "tcpdump":     {"linux": "sudo apt install -y tcpdump"},
    "wireshark":   {"windows": "choco install wireshark -y",  "linux": "sudo apt install -y tshark"},
    "responder":   {"all": "pip install Responder"},
    
    # ── Python Security Libraries ──
    "requests":    {"all": "pip install requests"},
    "scapy":       {"all": "pip install scapy"},
    "impacket":    {"all": "pip install impacket"},
    "pwntools":    {"all": "pip install pwntools"},
    "paramiko":    {"all": "pip install paramiko"},
    "beautifulsoup4": {"all": "pip install beautifulsoup4"},
    "lxml":        {"all": "pip install lxml"},
    "pycryptodome": {"all": "pip install pycryptodome"},
    
    # ── Utilities ──
    "curl":        {"windows": "choco install curl -y",       "linux": "sudo apt install -y curl"},
    "jq":          {"windows": "choco install jq -y",         "linux": "sudo apt install -y jq"},
    "ncat":        {"windows": "choco install nmap -y",       "linux": "sudo apt install -y ncat"},
    "certutil":    {},  # Built-in Windows
}

# ─── Smart Timeout Map ──────────────────────────────────────────────────────
# Commands that take a long time get automatically extended timeouts

SMART_TIMEOUTS = {
    "nmap":      300,   # 5 minutes — port scans take time
    "nikto":     600,   # 10 minutes — web vulnerability scanner
    "sqlmap":    600,   # 10 minutes — SQL injection tester
    "hydra":     300,   # 5 minutes — brute force
    "gobuster":  300,   # 5 minutes — directory brute force
    "ffuf":      300,   # 5 minutes — fuzzing
    "wfuzz":     300,   # 5 minutes — fuzzing
    "dirb":      300,   # 5 minutes — directory brute force
    "wapiti":    600,   # 10 minutes — web scanner
    "nuclei":    600,   # 10 minutes — vulnerability scanner
    "subfinder": 180,   # 3 minutes — subdomain discovery
    "masscan":   180,   # 3 minutes — fast port scanner
    "amass":     600,   # 10 minutes — subdomain enumeration
    "dirsearch": 300,   # 5 minutes — directory brute force
    "whatweb":   120,   # 2 minutes — web tech detection
    "wafw00f":   60,    # 1 minute — WAF detection
    "tracert":   120,   # 2 minutes — route tracing
    "traceroute":120,   # 2 minutes — route tracing
    "ping":      30,    # 30 seconds — basic connectivity
}

# Interval for streaming output updates to the UI
STREAM_INTERVAL_SECONDS = 10  # Reduced for better interactivity


class TerminalTool(BaseTool):
    """Tool for executing shell commands locally — with OS translation and auto-install."""

    def __init__(self) -> None:
        """Initialize terminal tool."""
        super().__init__(
            name="terminal_execute",
            description="Execute shell commands for penetration testing and system analysis."
        )
        self._consecutive_failures: int = 0
        self._MAX_AUTO_INSTALL_ATTEMPTS: int = 1  # Only try auto-install once per tool

    def get_schema(self) -> dict[str, Any]:
        """Get parameter schema for terminal execution."""
        return {
            "type": "object",
            "properties": {
                "command": {
                    "type": "string",
                    "description": "The shell command to execute for penetration testing"
                },
                "background": {
                    "type": "boolean",
                    "description": "Run the command in background (True for persistent services like servers)"
                },
                "timeout": {
                    "type": "integer",
                    "description": "Max seconds to wait for completion (default 30)"
                }
            },
            "required": ["command"]
        }

    def _translate_command(self, command: str) -> tuple[str, str | None]:
        """
        Translate a command for the current OS if needed.
        
        Returns:
            (translated_command, translation_note_or_None)
        """
        is_windows = os.name == "nt"
        parts = command.strip().split()
        if not parts:
            return command, None

        base_cmd = parts[0].lower()
        remaining = " ".join(parts[1:]) if len(parts) > 1 else ""
        
        if is_windows:
            # Check if this is a Linux command that needs translation
            if base_cmd in LINUX_TO_WINDOWS:
                replacement = LINUX_TO_WINDOWS[base_cmd]
                translated = f"{replacement} {remaining}".strip() if remaining else replacement
                note = f"[OS-ADAPT] Translated '{base_cmd}' -> '{replacement}' for Windows"
                print(f"DEBUG: {note}")
                return translated, note
        else:
            # Check if this is a Windows command on Linux
            if base_cmd in WINDOWS_TO_LINUX:
                replacement = WINDOWS_TO_LINUX[base_cmd]
                translated = f"{replacement} {remaining}".strip() if remaining else replacement
                note = f"[OS-ADAPT] Translated '{base_cmd}' -> '{replacement}' for Linux"
                print(f"DEBUG: {note}")
                return translated, note
        
        return command, None

    async def _try_auto_install(self, tool_name: str) -> dict[str, Any] | None:
        """
        Attempt to auto-install a missing tool.
        
        Returns:
            Install result dict, or None if tool isn't in the install map.
        """
        tool_key = tool_name.lower().strip()
        
        if tool_key not in INSTALL_MAP:
            return None
        
        is_windows = os.name == "nt"
        platform_key = "windows" if is_windows else "linux"
        install_info = INSTALL_MAP[tool_key]
        
        # Try platform-specific first, then 'all'
        install_cmd = install_info.get(platform_key) or install_info.get("all")
        if not install_cmd:
            return {"success": False, "result": f"No install method for '{tool_key}' on {platform_key}", "error": "No installer"}
        
        print(f"DEBUG: [AUTO-INSTALL] Attempting: {install_cmd}")
        
        try:
            if is_windows:
                process = await asyncio.create_subprocess_exec(
                    "powershell.exe", "-NoProfile", "-NonInteractive",
                    "-ExecutionPolicy", "Bypass", "-Command", install_cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                    cwd=os.getcwd()
                )
            else:
                process = await asyncio.create_subprocess_shell(
                    install_cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                    cwd=os.getcwd()
                )

            try:
                stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=120)
                stdout_str = stdout.decode(errors='ignore').strip()
                stderr_str = stderr.decode(errors='ignore').strip()
            except asyncio.TimeoutError:
                try:
                    process.kill()
                except:
                    pass
                return {"success": False, "result": "Install timed out after 120s", "error": "Timeout"}
            
            success = process.returncode == 0
            # Verify the tool is now available
            if success:
                is_available = shutil.which(tool_key) is not None
                if not is_available:
                    # Sometimes pip installs don't update PATH immediately
                    success = False
                    
            return {
                "success": success,
                "result": f"[AUTO-INSTALL] {'SUCCESS' if success else 'FAILED'}: {install_cmd}\n{stdout_str}\n{stderr_str}".strip(),
                "error": None if success else f"Install command returned code {process.returncode}"
            }
        except Exception as e:
            return {"success": False, "result": f"[AUTO-INSTALL] Exception: {str(e)}", "error": str(e)}

    async def execute(self, command: str = "", **kwargs: Any) -> dict[str, Any]:
        """
        Execute a shell command locally with OS translation and auto-install.

        Args:
            command: The command to execute.
            **kwargs: Additional arguments.

        Returns:
            Dictionary with success, result (stdout/stderr), and error.
        """
        if not command:
            return {"success": False, "result": "", "error": "No command provided"}

        try:
            is_windows = os.name == "nt"
            
            # ─── Step 1: OS-Aware Command Translation ───
            translated_command, translation_note = self._translate_command(command)
            
            # ─── Step 2: Prepare environment ───
            bin_path = os.path.join(os.getcwd(), "bin")
            env = os.environ.copy()
            if os.path.exists(bin_path):
                path_sep = ";" if is_windows else ":"
                env["PATH"] = f"{bin_path}{path_sep}{env.get('PATH', '')}"

            # ─── Step 3: Windows-specific curl alias fix ───
            if is_windows:
                safe_command = translated_command
                if safe_command.strip().lower().startswith("curl "):
                    safe_command = safe_command.replace("curl ", "curl.exe ", 1)
                elif " curl " in safe_command.lower():
                    safe_command = safe_command.replace(" curl ", " curl.exe ")
            else:
                safe_command = translated_command

            # ─── Step 4: Execute the command ───
            result = await self._run_command(safe_command, env, is_windows, **kwargs)
            
            # ─── Step 5: Auto-Install if "not found" ───
            if not result.get("success", False) and not result.get("background", False):
                combined = f"{result.get('result', '')} {result.get('error', '')}".lower()
                
                # Extract the tool name first
                failing_tool = command.strip().split()[0].lower()
                if "/" in failing_tool:
                    failing_tool = failing_tool.split("/")[-1]
                if "\\" in failing_tool:
                    failing_tool = failing_tool.split("\\")[-1]
                if failing_tool.endswith(".exe"):
                    failing_tool = failing_tool[:-4]
                
                # Tools that are ALWAYS available — never try to auto-install these
                always_available = {"python", "python3", "pip", "pip3", "node", "npm", "git", "powershell", "cmd", "bash", "sh"}
                
                # Check if this is a "tool not found" vs "file not found" error
                tool_not_found_indicators = [
                    "not recognized", "command not found",  
                    "is not recognized as an internal", "'s not installed",
                    "commandnotfoundexception"
                ]
                
                # "No such file or directory" is tricky — it could mean
                # the TOOL is missing OR a FILE argument is missing
                file_not_found = "no such file or directory" in combined or "cannot find the file" in combined or "cannot find path" in combined
                
                is_tool_missing = any(indicator in combined for indicator in tool_not_found_indicators)
                
                if file_not_found and not is_tool_missing:
                    # Check if the tool itself exists — if yes, it's a file arg issue, not a tool issue
                    if shutil.which(failing_tool):
                        # Tool exists, file doesn't — don't auto-install
                        result["error"] = (
                            f"STDERR/ERROR:\n{result.get('error', result.get('result', ''))}\n\n"
                            f"The command '{failing_tool}' is installed, but a file argument was not found. "
                            f"Check the file path and try again."
                        )
                    else:
                        is_tool_missing = True
                
                if is_tool_missing and failing_tool not in always_available:
                    print(f"DEBUG: [AUTO-INSTALL] Tool '{failing_tool}' not found. Attempting install...")
                    
                    install_result = await self._try_auto_install(failing_tool)
                    
                    if install_result and install_result.get("success"):
                        print(f"DEBUG: [AUTO-INSTALL] Install succeeded! Retrying: {safe_command}")
                        retry_result = await self._run_command(safe_command, env, is_windows, **kwargs)
                        
                        install_log = install_result.get("result", "")
                        retry_output = retry_result.get("result", "")
                        retry_result["result"] = f"{install_log}\n\n--- RETRY AFTER INSTALL ---\n\n{retry_output}".strip()
                        
                        if translation_note:
                            retry_result["result"] = f"{translation_note}\n{retry_result['result']}"
                        
                        return retry_result
                    elif install_result:
                        install_msg = install_result.get("result", "Install failed")
                        result["result"] = f"{result.get('result', '')}\n\n{install_msg}".strip()
                        result["error"] = (
                            f"Tool '{failing_tool}' is not installed and auto-install failed. "
                            f"Try a different approach or install it manually."
                        )
                    else:
                        result["error"] = (
                            f"Tool '{failing_tool}' is not installed and not in the auto-install registry. "
                            f"Use an alternative tool or install it manually."
                        )
            
            # Prepend translation note if any
            if translation_note and result.get("result"):
                result["result"] = f"{translation_note}\n{result['result']}"
            
            return result

        except Exception as e:
            return {
                "success": False,
                "result": "",
                "error": str(e)
            }

    async def _run_command(self, command: str, env: dict, is_windows: bool, **kwargs: Any) -> dict[str, Any]:
        """Core command execution with smart timeouts and real-time output streaming."""
        
        # ─── Smart Timeout Detection ───
        base_cmd = command.strip().split()[0].lower() if command.strip() else ""
        # Remove path/extension
        if "/" in base_cmd:
            base_cmd = base_cmd.split("/")[-1]
        if "\\" in base_cmd:
            base_cmd = base_cmd.split("\\")[-1]
        if base_cmd.endswith(".exe"):
            base_cmd = base_cmd[:-4]
        
        smart_timeout = SMART_TIMEOUTS.get(base_cmd)
        user_timeout = kwargs.get("timeout")
        
        if user_timeout:
            timeout = user_timeout  # User-specified timeout always wins
        elif smart_timeout:
            timeout = smart_timeout
            print(f"DEBUG: [SMART-TIMEOUT] '{base_cmd}' auto-timeout: {timeout}s")
        else:
            timeout = 60  # Default
        
        # ─── Start Process ───
        if is_windows:
            # Create a temporary script file to avoid CLI escaping nightmares
            fd, temp_script_path = tempfile.mkstemp(suffix=".ps1")
            try:
                # UTF-8 with BOM is best for PowerShell scripts
                with os.fdopen(fd, 'w', encoding='utf-8-sig') as f:
                    f.write(f"$OutputEncoding = [System.Text.Encoding]::UTF8;\n{command}")
                
                process = await asyncio.create_subprocess_exec(
                    "powershell.exe",
                    "-NoProfile", "-NonInteractive",
                    "-ExecutionPolicy", "Bypass",
                    "-File", temp_script_path,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                    cwd=os.getcwd(),
                    env=env
                )
            except Exception as e:
                # Fallback to shell if temp file fails
                if os.path.exists(temp_script_path):
                    os.remove(temp_script_path)
                process = await asyncio.create_subprocess_shell(
                    command,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                    cwd=os.getcwd(),
                    env=env
                )
        else:
            temp_script_path = None
            process = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=os.getcwd(),
                env=env
            )

        if kwargs.get("background"):
            return {
                "success": True,
                "result": f"Service started in background: {command}",
                "error": None,
                "background": True
            }

        # ─── Progressive Output Reading with Real-Time Streaming ───
        events = EventBus.get()
        events.emit_tool(status="start", name="terminal_execute", args={"command": command})
        
        collected_stdout = []
        collected_stderr = []
        start_time = time.time()
        last_stream_time = start_time
        last_streamed_length = 0
        timed_out = False
        skip_requested = False

        def on_skip_event(e):
            nonlocal skip_requested
            skip_requested = True

        events.subscribe(EventType.SKIP_TOOL, on_skip_event)
        
        async def _read_stream(stream, collector):
            """Read a stream line by line."""
            while True:
                try:
                    line = await stream.readline()
                    if not line:
                        break
                    decoded = line.decode(errors='ignore')
                    collector.append(decoded)
                except Exception:
                    break
        
        # Start reading both streams concurrently
        stdout_task = asyncio.create_task(_read_stream(process.stdout, collected_stdout))
        stderr_task = asyncio.create_task(_read_stream(process.stderr, collected_stderr))
        
        # Stream progress updates while waiting
        try:
            while not stdout_task.done() or not stderr_task.done():
                # Check skip request
                if skip_requested:
                    print(f"DEBUG: [SKIP] Tool '{base_cmd}' skipped by user.")
                    try:
                        process.kill()
                    except:
                        pass
                    break

                # Check timeout
                elapsed = time.time() - start_time
                if elapsed > timeout:
                    timed_out = True
                    print(f"DEBUG: [TIMEOUT] Command timed out after {timeout}s. Collecting partial output...")
                    try:
                        process.kill()
                    except:
                        pass
                    break
                
                # Stream partial output to the UI every STREAM_INTERVAL_SECONDS
                now = time.time()
                if now - last_stream_time >= STREAM_INTERVAL_SECONDS:
                    current_output = "".join(collected_stdout)
                    new_content = current_output[last_streamed_length:]
                    if new_content.strip():
                        # Send real-time update to the UI
                        elapsed_str = f"{int(elapsed)}s"
                        events.emit_message(
                            f"[LIVE OUTPUT - {elapsed_str}] {base_cmd}:\n{new_content[-500:]}",
                            "info"
                        )
                        last_streamed_length = len(current_output)
                    else:
                        # Still running but no new output — Emit a TOOL "running" event for the UI to show progress
                        events.emit_tool(
                            status="running",
                            name="terminal_execute",
                            args={"command": base_cmd, "elapsed": int(elapsed), "timeout": timeout}
                        )
                    last_stream_time = now
                
                # Small wait to avoid busy loop
                await asyncio.sleep(1)
        except asyncio.CancelledError:
            try:
                process.kill()
            except:
                pass
        finally:
            events.unsubscribe(EventType.SKIP_TOOL, on_skip_event)
        
        # Wait for remaining stream data
        try:
            await asyncio.wait_for(asyncio.gather(stdout_task, stderr_task, return_exceptions=True), timeout=5)
        except asyncio.TimeoutError:
            pass
        
        # Wait for process to fully exit
        try:
            await asyncio.wait_for(process.wait(), timeout=3)
        except asyncio.TimeoutError:
            try:
                process.kill()
            except:
                pass
        
        # ─── Cleanup Temporary Script ───
        if is_windows and temp_script_path and os.path.exists(temp_script_path):
            try: os.remove(temp_script_path)
            except: pass
        
        stdout_str = "".join(collected_stdout).strip()
        stderr_str = "".join(collected_stderr).strip()
        combined_output = f"{stdout_str}\n{stderr_str}".strip()
        
        if timed_out:
            if combined_output:
                # Return partial output instead of nothing!
                combined_output = (
                    f"[PARTIAL OUTPUT - Command timed out after {timeout}s but collected data below]\n\n"
                    f"{combined_output}"
                )
                return {
                    "success": True,  # Mark as success since we got partial data
                    "result": combined_output,
                    "error": f"Command timed out after {timeout}s but partial output was captured.",
                    "timed_out": True,
                    "partial": True
                }
            else:
                return {
                    "success": False,
                    "result": "",
                    "error": (
                        f"Command '{base_cmd}' timed out after {timeout}s with no output. "
                        f"Try: (1) targeting specific ports instead of full scan, "
                        f"(2) using -T2 for slower but more reliable scans, "
                        f"(3) increasing timeout with the 'timeout' parameter."
                    ),
                    "timed_out": True
                }

        # ─── Soft Truncation ───
        MAX_CHARS = 40000
        if len(combined_output) > MAX_CHARS:
            keep = MAX_CHARS // 2
            combined_output = (
                f"{combined_output[:keep]}\n\n"
                f"[... OUTPUT TRUNCATED: {len(combined_output) - MAX_CHARS} characters hidden ...]\n\n"
                f"{combined_output[-keep:]}"
            )

        # ─── Diagnostic Error Messages ───
        returncode = process.returncode if process.returncode is not None else -1
        error_msg = None if returncode == 0 else f"Execution failed with code {returncode}"
        if returncode != 0:
            if "not recognized" in combined_output.lower() or "command not found" in combined_output.lower():
                tool_name = command.split()[0]
                if not shutil.which(tool_name):
                    error_msg = (
                        f"DIAGNOSTIC: Tool '{tool_name}' is not installed or not in PATH. "
                        f"Use an alternative tool or install it first."
                    )
                else:
                    error_msg = (
                        f"DIAGNOSTIC: Command failed. The tool '{tool_name}' exists but the command had errors. "
                        f"Check the arguments and file paths."
                    )
            elif "handle could not be duplicated" in combined_output.lower():
                error_msg = (
                    "DIAGNOSTIC: Windows handle duplication failure. "
                    "Try a simpler command without complex redirection."
                )
            
            if any(term in combined_output.lower() for term in [
                "403 forbidden", "406 not acceptable", "access denied", "waf", "security checkpoint"
            ]):
                error_msg = (error_msg or "Execution blocked") + " (STEALTH HINT: WAF/firewall detected. Adjust timing and payloads.)"

        return {
            "success": returncode == 0,
            "result": combined_output,
            "error": error_msg,
            "returncode": returncode
        }
