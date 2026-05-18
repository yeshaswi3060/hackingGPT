# GuardianSentinel: AI-Driven Endpoint Detection & Response (EDR)

GuardianSentinel is a professional-grade host-based security suite inspired by advanced monitoring techniques but re-engineered for **total defensive visibility and automated threat remediation**.

## 🛡️ Project Blueprint
GuardianSentinel operates on a "Dual-Engine" architecture:
1.  **Local Sentinel Engine (PowerShell)**: Real-time, zero-latency enforcement of local security policies.
2.  **AI Analyst Engine (Groq AI)**: Cloud-side behavioral analysis to detect subtle, long-term, and zero-day threats.

---

## 🚀 Core Features (The 40-Point Defense)

### 1. Process & Execution Security
- **PPID Spoofing Detection**: Blocks processes claiming fake parent identities.
- **Encoded Command Blocking**: Instantly kills PowerShell instances with Base64 payloads.
- **Living-off-the-Land (LotL) Watchdog**: Monitors usage of system binaries like `certutil` and `bitsadmin`.
- **In-Memory Execution Guard**: Detects reflective loading and fileless malware.
- **Process Hollowing Protection**: Monitors for process image replacement.
- **DLL Sideloading Detection**: Alerts on suspicious library loads from user directories.
- **Execution Policy Enforcement**: Ensures only signed scripts can run.
- **AMSI Integration**: Scans scripts post-deobfuscation.

### 2. Persistence & Anti-Immortality
- **Scheduled Task Lock**: Real-time audit and blocking of unauthorized tasks.
- **Registry "Run" Key State-Lock**: Automatically reverts unauthorized startup entries.
- **WMI Event Monitor**: Detects permanent event consumers (stealth persistence).
- **Service Creation Alert**: Monitors for new/modified Windows Services.
- **Startup Folder Protection**: Guards the Windows Startup directory.
- **Winlogon Hijack Detection**: Monitors Shell and Userinit registry keys.
- **COM Hijacking Monitor**: Protects against CLSID redirection.

### 3. Data & Identity Protection
- **DPAPI Access Monitoring**: Guards browser master keys and passwords.
- **SQLite Database Lock**: Blocks non-browser processes from reading credential databases.
- **LSASS Memory Protection**: Prevents credential dumping (Mimikatz).
- **SAM/SYSTEM Hive Guard**: Blocks unauthorized backups of sensitive registry hives.
- **Honeypot/Canary File Monitor**: Triggers alerts when "bait" files are accessed.
- **Credential Manager Audit**: Tracks queries to the Windows Vault.

### 4. Network & Exfiltration Defense
- **AI Beaconing Detection**: Identifies C2 heartbeat patterns.
- **DNS Tunneling Detection**: Spots data leakage via DNS queries.
- **Cloud API Traffic Filter**: Monitors traffic to Discord/Telegram/Pastebin.
- **Reverse Shell Detection**: Identifies sockets connected to command shells.
- **ARP/X-Ray Audit**: Blocks internal network mapping and reconnaissance.
- **Stealth RDP Monitor**: Detects unauthorized RDP activation.
- **Traffic Anomaly Detection**: Alerts on high-volume data movement from user profiles.

### 5. Stealth & Anti-Forensics Defense
- **Event Log Integrity**: Alerts on log clearing attempts (`wevtutil cl`).
- **Hidden/System Attribute Guard**: Detects files hiding using `+h +s` attributes.
- **Self-Deletion Detection**: Monitors for scripts that delete themselves post-execution.
- **Time-Stomping Detection**: Catching files with manually altered timestamps.
- **Process Termination Protection**: Prevents malware from killing the Guardian agent.
- **Token Impersonation Alert**: Blocks privilege escalation via token theft.

### 6. AI Intelligence (Groq AI Layer)
- **Semantic Anomaly Detection**: AI recognizes context-sensitive threats (e.g., HR user running `net view`).
- **Risk Scoring**: Aggregates multiple low-level alerts into a critical incident.
- **Automated Remediation**: AI-triggered network isolation or process termination.
- **Natural Language Incident Reporting**: Human-readable summaries of complex technical breaches.

### 7. Active URL Isolation & Privacy (Safe-Bridge)
- **Safe-Bridge Browser Isolation**: Automatically blocks risky URLs and launches them in Windows Sandbox.
- **Privacy-Mask (IP Rotation)**: Initiates VPN/Proxy shift when entering "Risk Zones."
- **AI URL Classification**: Real-time Domain Trust Scoring via Groq AI.

### 8. Elite Defense & Deception (Deception Grid)
- **Honey-Token Injection**: Places fake API keys (AWS/Discord) in environment variables to trap and track hackers.
- **Clipboard Decoy & Obfuscation**: Swaps real clipboard data for "junk data" when an unauthorized process attempts to read it.
- **Moving-File-System (MFS) Persistence**: Periodically renames and migrates the GuardianSentinel agent to random paths to prevent targeting.
- **Hardware-Level Fingerprinting**: Verifies CPU/Motherboard UUIDs to detect if the system has been "cloned" into a hacker's VM.
- **Polymorphic Self-Mutation**: The agent's core code re-compiles itself every 24 hours with randomized structures to prevent signature detection.

### 9. God-Tier & Overlord Dominance (The Unbreakable Tier)
- **The "Hallucination" Sandbox**: Redirects detected attackers to a simulated "Mirror World" filesystem where they can "steal" fake data while being monitored.
- **DMA (Direct Memory Access) Shield**: Audits the hardware bus for unauthorized DMA devices to prevent RAM-scraping via physical hardware.
- **Network Gaslighting**: Intercepts active exfiltration streams and replaces sensitive data with AI-generated "Poisoned Disinformation."
- **"Death-Grip" Hardware Lock**: Remotely disables the Network Adapter (NIC) and locks the BIOS/UEFI if a catastrophic breach is confirmed.
- **Phantom User Simulation**: Simulates realistic user activity (typing, browsing) during idle periods to lure RATs into revealing themselves.
- **Acoustic Hacker Fingerprinting**: AI analysis of an attacker's unique typing cadence to identify them across different sessions and IPs.
- **Ghost-In-The-Shell (Kernel Hiding)**: Reverses the "Shift" technique to hide the Sentinel agent inside core system processes, making it invisible to all tools.

### 10. Academic & Institutional Shield (School Edition)
- **Unauthorized Device Kill-Switch**: Maintains a "White-List" of authorized hardware; instantly disables any unauthorized USB devices (BadUSB, Rubber Ducky).
- **Lateral Movement Lockdown**: Blocks all internal network scanning and reconnaissance attempts by students to prevent school-wide hacking.
- **AI Sentiment & Harm Guard**: Uses Groq AI to monitor for cyberbullying or self-harm patterns, providing early warning alerts to school counselors.
- **Crypto-Miner & Resource Guardian**: Detects and throttles high-resource processes (miners, games) to preserve school hardware.

### 11. Exam "Iron-Curtain" (The Ultimate Proctored Environment)
- **Application White-Listing**: Ensures that *only* the authorized exam browser is running; any other process (Notepad, Calculator, Discord) is auto-killed.
- **Clipboard Watermarking**: Replaces clipboard content with "invisible markers" to detect and trace any unauthorized copy-pasting during tests.
- **Multi-Monitor Lockdown**: Automatically detects and disables secondary/tertiary monitors to prevent the use of hidden notes.
- **Network Isolation (Exam-Net)**: Disconnects the machine from the Global Internet, allowing access *only* to the specific Exam Server IP.
- **Impossible Typing Detection**: AI analysis to detect if long answers are being "pasted" or typed at speeds impossible for a human (detecting automated scripts).
- **Silent Snapshot Audit**: Periodically captures and transmits silent screenshots to the "Teacher's Dashboard" for real-time monitoring.

> [!CAUTION]
> **LEGAL & ETHICAL DISCLAIMER**: The features described in GuardianSentinel are intended for **defensive, educational, and authorized security auditing purposes only**. The use of deception technology, data encryption, and system monitoring must comply with local privacy laws and organizational policies. Unauthorized deployment on third-party systems is strictly prohibited.

---

## 🛠️ Local Edge Intelligence (The ".ps1" Power)
Unlike standard monitoring tools, GuardianSentinel's local agent is capable of **Independent Enforcement**:
-   **State Enforcement**: Automatically resets critical registry keys every 5 seconds.
-   **Heuristic Blocking**: Kills processes matching known malicious command-line patterns without waiting for the server.
-   **Process Hardening**: Prevents productivity apps (Office, Browsers) from spawning shells (CMD, PowerShell).
-   **Anti-Kill Watchdog**: Uses a dual-process heartbeat to ensure the agent cannot be easily terminated.

---

## 📈 Roadmap
1.  **Phase 1**: Implement core `Process-Monitor` and `Registry-Guard` modules.
2.  **Phase 2**: Establish secure HTTPS uplink to Central Server.
3.  **Phase 3**: Integrate Groq AI for real-time telemetry analysis.
4.  **Phase 4**: Add Automated Remediation (Isolation & Kill-Switches).

---

## 🛡️ Why GuardianSentinel Stops Hackers

*   **Zero Persistence (The Sandbox)**: Any malware or exploit delivered via a "risky" website occurs inside a disposable Windows Sandbox. Once closed, the threat is **completely erased** with no way to infect the host machine.
*   **Identity Masking (The IP Shift)**: By rotating the IP address before entering high-risk zones, the machine becomes a "moving target," preventing hackers from tracking, geo-locating, or targeting the user's real network infrastructure.
*   **Edge Enforcement (Immediate Action)**: Unlike standard antivirus that waits for a signature, GuardianSentinel's local PowerShell logic acts in **milliseconds** based on behavior, stopping hacks before they can even report back to their C2 server.
*   **AI-Powered Intuition**: By offloading complex analysis to Groq AI, the system can detect "Human-like" suspicious patterns that traditional rule-based firewalls would miss.

---
*Created by GuardianSentinel Project Team | Security for the Modern Era*
