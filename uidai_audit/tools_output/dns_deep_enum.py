"""
DNS Deep Enumeration — UIDAI full DNS recon
"""
import dns.resolver
import dns.query
import dns.zone
import requests
import json

DOMAIN = "uidai.gov.in"

RECORD_TYPES = ["A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA", "SRV", "CAA"]

SUBDOMAINS = [
    "www", "mail", "webmail", "ftp", "admin", "api", "dev", "staging",
    "test", "portal", "login", "auth", "sso", "oauth", "accounts",
    "gateway", "cdn", "static", "assets", "media", "upload",
    "mobile", "app", "apps", "android", "ios",
    "support", "help", "kb", "docs", "developer",
    "payment", "pay", "billing", "secure",
    "vpn", "remote", "rdp", "ssh",
    "jenkins", "jira", "confluence", "gitlab",
    "monitoring", "metrics", "grafana", "kibana",
    "es", "elastic", "redis", "database", "db",
    "internal", "intranet", "corp", "private",
    "beta", "sandbox", "uat", "qa", "preprod",
    "resident", "myaadhaar", "bookappointment", "pehchaan",
    "enroll", "enrolment", "update", "verify", "download",
    "status", "health", "ping", "api2", "v2", "v1",
    "consent", "kyc", "ekyc", "biometric",
    "helpdesk", "ticket", "grievance", "feedback",
    "bhuvan", "dashboard", "reports", "analytics",
]

print("=" * 60)
print(f"DNS DEEP ENUMERATION — {DOMAIN}")
print("=" * 60)

resolver = dns.resolver.Resolver()
resolver.timeout = 3
resolver.lifetime = 3

# 1. Standard DNS Records
print("\n[1] DNS Record Enumeration")
for rtype in RECORD_TYPES:
    try:
        answers = resolver.resolve(DOMAIN, rtype)
        print(f"\n  {rtype} Records:")
        for r in answers:
            print(f"    {r}")
    except Exception:
        pass

# 2. Subdomain Discovery
print(f"\n\n[2] Subdomain Discovery ({len(SUBDOMAINS)} candidates)")
found_subdomains = []

for sub in SUBDOMAINS:
    fqdn = f"{sub}.{DOMAIN}"
    try:
        answers = resolver.resolve(fqdn, "A")
        ips = [str(r) for r in answers]
        print(f"  ✅ FOUND: {fqdn} → {', '.join(ips)}")
        found_subdomains.append({"subdomain": fqdn, "ips": ips})
    except dns.resolver.NXDOMAIN:
        pass  # doesn't exist — normal
    except dns.resolver.NoAnswer:
        # Exists but no A record — check CNAME
        try:
            cname = resolver.resolve(fqdn, "CNAME")
            target = str(list(cname)[0])
            print(f"  ⚠️  CNAME: {fqdn} → {target} (check for takeover!)")
            found_subdomains.append({"subdomain": fqdn, "cname": target, "potential_takeover": True})
        except:
            pass
    except Exception:
        pass

# 3. Zone Transfer Attempt (passive — just checking if allowed)
print("\n\n[3] Zone Transfer Check (AXFR)")
try:
    ns_records = resolver.resolve(DOMAIN, "NS")
    for ns in ns_records:
        ns_str = str(ns).rstrip(".")
        print(f"  Trying zone transfer from {ns_str}...")
        try:
            z = dns.zone.from_xfr(dns.query.xfr(ns_str, DOMAIN, timeout=5))
            print(f"  [!!!] ZONE TRANSFER SUCCEEDED on {ns_str} — CRITICAL FINDING!")
        except Exception as e:
            print(f"  [ok] Zone transfer refused: {e}")
except Exception as e:
    print(f"  Error: {e}")

# 4. Certificate Transparency via crt.sh (HTTP-based, passive)
print("\n\n[4] Certificate Transparency — crt.sh")
try:
    r = requests.get(f"https://crt.sh/?q=%.{DOMAIN}&output=json", timeout=15)
    certs = r.json()
    ct_subdomains = set()
    for cert in certs:
        names = cert.get("name_value", "").split("\n")
        for name in names:
            name = name.strip().lstrip("*.")
            if DOMAIN in name:
                ct_subdomains.add(name)
    
    print(f"  Found {len(ct_subdomains)} unique domains in CT logs:")
    for sub in sorted(ct_subdomains):
        print(f"  {sub}")
except Exception as e:
    print(f"  Error: {e}")

# Save results
print("\n\n[5] Summary")
print(f"  Active subdomains found: {len(found_subdomains)}")
with open("dns_enum_results.txt", "w") as f:
    f.write(f"DNS Enumeration Results — {DOMAIN}\n" + "="*60 + "\n\n")
    f.write(f"Active Subdomains:\n")
    for s in found_subdomains:
        f.write(f"  {json.dumps(s)}\n")
print("[+] Saved to dns_enum_results.txt")
