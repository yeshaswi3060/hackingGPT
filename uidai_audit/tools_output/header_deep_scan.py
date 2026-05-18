"""
Deep Security Header Scanner — Full analysis of all UIDAI portals
"""
import requests

TARGETS = [
    "https://uidai.gov.in/en/",
    "https://myaadhaar.uidai.gov.in/",
    "https://bookappointment.uidai.gov.in/",
    "https://myaadhaar.uidai.gov.in/verifyAadhaar",
    "https://myaadhaar.uidai.gov.in/lock-unlock-aadhaar/en",
    "https://myaadhaar.uidai.gov.in/genricDownloadAadhaar/en",
    "https://myaadhaar.uidai.gov.in/retrieve-eid-uid/en",
    "https://myaadhaar.uidai.gov.in/offline-ekyc",
]

REQUIRED_HEADERS = {
    "Strict-Transport-Security": {"required": True, "check": lambda v: "max-age" in v},
    "Content-Security-Policy": {"required": True, "check": lambda v: len(v) > 10},
    "X-Frame-Options": {"required": True, "check": lambda v: v in ["DENY", "SAMEORIGIN"]},
    "X-Content-Type-Options": {"required": True, "check": lambda v: v == "nosniff"},
    "X-XSS-Protection": {"required": True, "check": lambda v: "1" in v},
    "Referrer-Policy": {"required": True, "check": lambda v: v not in ["unsafe-url", ""]},
    "Permissions-Policy": {"required": False, "check": lambda v: len(v) > 5},
    "Cache-Control": {"required": False, "check": lambda v: "no-store" in v or "private" in v},
}

DANGEROUS_HEADERS = ["Server", "X-Powered-By", "X-AspNet-Version", "X-Generator", "X-Serving-Dc", "X-Envoy-Upstream-Service-Time"]

CSP_DANGEROUS = ["'unsafe-inline'", "'unsafe-eval'", "data:", "*"]

print("=" * 70)
print("UIDAI DEEP SECURITY HEADER SCANNER")
print("=" * 70)

all_findings = []

for target in TARGETS:
    print(f"\n{'='*70}")
    print(f"TARGET: {target}")
    print(f"{'='*70}")
    try:
        r = requests.get(target, timeout=15, allow_redirects=True,
                        headers={"User-Agent": "Mozilla/5.0"})
        headers = r.headers
        
        # Check required headers
        print("\n[Security Headers]")
        for hdr, config in REQUIRED_HEADERS.items():
            val = headers.get(hdr, None)
            if val is None:
                status = "❌ MISSING"
                if config["required"]:
                    all_findings.append(f"MISSING header '{hdr}' on {target}")
            else:
                ok = config["check"](val)
                status = f"✅ Present: {val[:80]}" if ok else f"⚠️  Weak: {val[:80]}"
                if not ok:
                    all_findings.append(f"WEAK header '{hdr}={val}' on {target}")
            print(f"  {hdr}: {status}")
        
        # Check info disclosure headers
        print("\n[Information Disclosure Headers]")
        for hdr in DANGEROUS_HEADERS:
            val = headers.get(hdr, None)
            if val:
                print(f"  ⚠️  {hdr}: {val}  ← EXPOSED!")
                all_findings.append(f"INFO DISCLOSURE: '{hdr}: {val}' on {target}")
            else:
                print(f"  ✅ {hdr}: not present")
        
        # CSP Analysis
        csp = headers.get("Content-Security-Policy", "")
        if csp:
            print("\n[CSP Analysis]")
            for dangerous in CSP_DANGEROUS:
                if dangerous in csp:
                    print(f"  ❌ DANGEROUS directive: {dangerous}")
                    all_findings.append(f"DANGEROUS CSP directive '{dangerous}' on {target}")
        
        # Cookie analysis
        cookies = r.cookies
        raw_cookies = headers.get("Set-Cookie", "")
        if raw_cookies or cookies:
            print("\n[Cookie Analysis]")
            print(f"  Raw Set-Cookie: {raw_cookies[:200]}")
            if "SameSite=None" in raw_cookies:
                print("  ❌ SameSite=None — CSRF possible!")
                all_findings.append(f"COOKIE SameSite=None on {target}")
            if "SameSite" not in raw_cookies and raw_cookies:
                print("  ❌ SameSite not set!")
                all_findings.append(f"COOKIE missing SameSite on {target}")
            if "HttpOnly" not in raw_cookies and raw_cookies:
                print("  ❌ HttpOnly not set — JS can read cookie!")
                all_findings.append(f"COOKIE missing HttpOnly on {target}")
            if "Secure" not in raw_cookies and raw_cookies:
                print("  ❌ Secure flag missing!")
                all_findings.append(f"COOKIE missing Secure flag on {target}")
        
        # Interesting custom headers
        print("\n[All Response Headers]")
        for k, v in headers.items():
            print(f"  {k}: {v[:100]}")
            
    except Exception as e:
        print(f"  Error: {e}")

print(f"\n{'='*70}")
print(f"FINDINGS SUMMARY — {len(all_findings)} issues found")
print(f"{'='*70}")
for f in all_findings:
    print(f"  [!] {f}")

with open("header_scan_results.txt", "w", encoding="utf-8") as f:
    f.write("UIDAI Deep Header Scan Results\n" + "="*60 + "\n\n")
    for finding in all_findings:
        f.write(f"[!] {finding}\n")
print("\n[+] Saved to header_scan_results.txt")
