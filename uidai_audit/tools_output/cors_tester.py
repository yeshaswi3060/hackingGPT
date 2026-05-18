"""
CORS Misconfiguration Tester — UIDAI Passive Audit
Tests whether UIDAI portals reflect arbitrary Origins (CORS misconfiguration)
"""
import requests

TARGETS = [
    "https://uidai.gov.in/en/",
    "https://myaadhaar.uidai.gov.in/",
    "https://bookappointment.uidai.gov.in/",
]

EVIL_ORIGINS = [
    "https://evil.com",
    "https://attacker.uidai.gov.in.evil.com",
    "null",
    "https://uidai.gov.in.evil.com",
    "https://notuidai.gov.in",
]

print("=" * 60)
print("UIDAI CORS MISCONFIGURATION TEST")
print("=" * 60)

results = []

for target in TARGETS:
    print(f"\n[TARGET] {target}")
    for origin in EVIL_ORIGINS:
        try:
            headers = {"Origin": origin, "User-Agent": "Mozilla/5.0"}
            r = requests.get(target, headers=headers, timeout=10, allow_redirects=True)
            acao = r.headers.get("Access-Control-Allow-Origin", "NOT SET")
            acac = r.headers.get("Access-Control-Allow-Credentials", "NOT SET")
            
            is_vuln = False
            if acao == origin:
                is_vuln = True
                tag = "[!] VULNERABLE — Reflects origin!"
            elif acao == "*":
                tag = "[!] Wildcard — public CORS (check sensitivity)"
            else:
                tag = "[ok]"
            
            print(f"  Origin: {origin}")
            print(f"    ACAO: {acao} | ACAC: {acac} {tag}")
            
            if is_vuln:
                results.append({
                    "target": target,
                    "origin": origin,
                    "acao": acao,
                    "acac": acac,
                    "vulnerable": True
                })
        except Exception as e:
            print(f"  Error: {e}")

print("\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)
if results:
    print(f"[!!!] {len(results)} CORS VULNERABILITIES FOUND:")
    for r in results:
        print(f"  {r['target']} reflects {r['origin']} | Credentials: {r['acac']}")
else:
    print("[ok] No CORS misconfigurations detected")
