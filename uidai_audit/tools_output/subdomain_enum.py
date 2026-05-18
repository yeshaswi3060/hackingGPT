"""
Aggressive Subdomain Enumerator for uidai.gov.in
Queries AlienVault, HackerTarget, and RapidDNS to find all subdomains.
"""
import requests
import json
import re
import urllib3
import time

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

DOMAIN = "uidai.gov.in"
subdomains = set()

def query_alienvault():
    print("[*] Querying AlienVault OTX...")
    try:
        url = f"https://otx.alienvault.com/api/v1/indicators/domain/{DOMAIN}/passive_dns"
        r = requests.get(url, timeout=10)
        if r.status_code == 200:
            data = r.json()
            for entry in data.get('passive_dns', []):
                hostname = entry.get('hostname', '').lower()
                if DOMAIN in hostname and '*' not in hostname:
                    subdomains.add(hostname)
        print(f"  [-] AlienVault found: {len(subdomains)} total so far")
    except Exception as e:
        print(f"  [!] AlienVault error: {e}")

def query_hackertarget():
    print("[*] Querying HackerTarget...")
    try:
        url = f"https://api.hackertarget.com/hostsearch/?q={DOMAIN}"
        r = requests.get(url, timeout=10)
        if r.status_code == 200:
            lines = r.text.split('\n')
            count = 0
            for line in lines:
                if ',' in line:
                    hostname = line.split(',')[0].lower()
                    if DOMAIN in hostname and '*' not in hostname:
                        subdomains.add(hostname)
                        count += 1
            print(f"  [-] HackerTarget added {count} subdomains")
    except Exception as e:
        print(f"  [!] HackerTarget error: {e}")

def query_rapiddns():
    print("[*] Querying RapidDNS...")
    try:
        url = f"https://rapiddns.io/subdomain/{DOMAIN}?full=1#result"
        r = requests.get(url, timeout=15, verify=False)
        if r.status_code == 200:
            # Extract subdomains using regex from the HTML table
            matches = re.findall(r'<td>([a-zA-Z0-9\-\.]+\.uidai\.gov\.in)</td>', r.text, re.IGNORECASE)
            count = 0
            for match in matches:
                hostname = match.lower()
                if '*' not in hostname:
                    if hostname not in subdomains:
                        subdomains.add(hostname)
                        count += 1
            print(f"  [-] RapidDNS added {count} subdomains")
    except Exception as e:
        print(f"  [!] RapidDNS error: {e}")

def query_crtsh():
    print("[*] Querying crt.sh (Certificate Transparency)...")
    try:
        # Using the HTML output and regex since JSON API is often broken
        url = f"https://crt.sh/?q=%.{DOMAIN}"
        r = requests.get(url, timeout=20)
        if r.status_code == 200:
            matches = re.findall(r'<TD>([a-zA-Z0-9\-\.]+\.uidai\.gov\.in)</TD>', r.text, re.IGNORECASE)
            count = 0
            for match in matches:
                hostname = match.lower()
                # Handle multi-domain certs where they are separated by <BR>
                for sub in hostname.split('<br>'):
                    sub = sub.strip()
                    if DOMAIN in sub and '*' not in sub:
                        if sub not in subdomains:
                            subdomains.add(sub)
                            count += 1
            print(f"  [-] crt.sh added {count} subdomains")
    except Exception as e:
        print(f"  [!] crt.sh error: {e}")

print("=" * 60)
print(f"UIDAI MASS SUBDOMAIN ENUMERATION")
print("=" * 60)

query_alienvault()
time.sleep(1)
query_hackertarget()
time.sleep(1)
query_rapiddns()
time.sleep(1)
query_crtsh()

print("=" * 60)
print(f"Total Unique Subdomains Found: {len(subdomains)}")

output_file = "all_uidai_subdomains.txt"
with open(output_file, "w") as f:
    for sub in sorted(list(subdomains)):
        f.write(f"{sub}\n")

print(f"Saved to {output_file}")
