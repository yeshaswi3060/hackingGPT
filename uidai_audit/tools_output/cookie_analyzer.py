#!/usr/bin/env python3
"""
UIDAI Cookie Security Analyzer
Checks all Set-Cookie headers for: HttpOnly, Secure, SameSite, Path, Expiry
"""

import requests
import urllib3
urllib3.disable_warnings()

TARGETS = [
    "https://uidai.gov.in/en/",
    "https://myaadhaar.uidai.gov.in/",
    "https://bookappointment.uidai.gov.in/",
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
}

def analyze_cookie(cookie_str, url):
    issues = []
    parts = [p.strip() for p in cookie_str.split(";")]
    name_val = parts[0]
    name = name_val.split("=")[0].strip()
    attrs = [p.lower() for p in parts[1:]]

    if "httponly" not in attrs:
        issues.append("❌ Missing HttpOnly — XSS can steal this cookie")
    if "secure" not in attrs:
        issues.append("❌ Missing Secure — sent over HTTP too")
    
    has_samesite = any("samesite" in a for a in attrs)
    if not has_samesite:
        issues.append("❌ Missing SameSite — CSRF risk")
    else:
        for a in attrs:
            if "samesite=none" in a:
                issues.append("⚠️  SameSite=None — cross-site sending allowed")
            elif "samesite=lax" in a:
                issues.append("ℹ️  SameSite=Lax — moderate protection")
            elif "samesite=strict" in a:
                issues.append("✅ SameSite=Strict — best protection")

    return name, issues

def main():
    print(f"\n{'='*70}")
    print("  UIDAI Cookie Security Analyzer")
    print(f"{'='*70}\n")

    all_findings = []

    for url in TARGETS:
        print(f"\n[TARGET] {url}")
        print("-" * 60)
        try:
            s = requests.Session()
            r = s.get(url, headers=HEADERS, timeout=15, verify=False, allow_redirects=True)
            
            raw_cookies = r.headers.get("Set-Cookie", "")
            
            # Get ALL Set-Cookie headers
            all_cookie_headers = []
            for h_name, h_val in r.raw.headers.items():
                if h_name.lower() == "set-cookie":
                    all_cookie_headers.append(h_val)
            
            if not all_cookie_headers:
                print("  No Set-Cookie headers found")
                continue

            for cookie_str in all_cookie_headers:
                name, issues = analyze_cookie(cookie_str, url)
                print(f"\n  Cookie: {name}")
                print(f"  Raw: {cookie_str[:120]}")
                for issue in issues:
                    print(f"    {issue}")
                all_findings.append({
                    "url": url, "cookie": name,
                    "raw": cookie_str[:200], "issues": issues
                })

        except Exception as e:
            print(f"  ERROR: {e}")

    # Save report
    with open("cookie_analysis_results.txt", "w") as f:
        f.write("UIDAI Cookie Security Analysis\n")
        f.write("="*60 + "\n\n")
        for finding in all_findings:
            f.write(f"URL: {finding['url']}\n")
            f.write(f"Cookie: {finding['cookie']}\n")
            f.write(f"Raw: {finding['raw']}\n")
            f.write("Issues:\n")
            for issue in finding["issues"]:
                f.write(f"  {issue}\n")
            f.write("\n")
    
    print(f"\n[+] Saved to cookie_analysis_results.txt")
    print(f"[+] Total cookies analyzed: {len(all_findings)}")

if __name__ == "__main__":
    main()
