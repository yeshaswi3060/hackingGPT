#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
"""
UIDAI HTTP Method Tester
Tests for allowed dangerous HTTP methods: TRACE, PUT, DELETE, CONNECT
Passive - only observes responses, sends no destructive payload
"""

import requests
import urllib3
urllib3.disable_warnings()

TARGETS = [
    "https://uidai.gov.in/en/",
    "https://myaadhaar.uidai.gov.in/",
    "https://bookappointment.uidai.gov.in/",
]

METHODS = ["OPTIONS", "TRACE", "PUT", "DELETE", "PATCH", "HEAD", "CONNECT"]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
}

def test_methods():
    results = {}
    
    print(f"\n{'='*70}")
    print("  UIDAI HTTP Method Tester — Passive Security Check")
    print(f"{'='*70}\n")

    for target in TARGETS:
        print(f"\n[TARGET] {target}")
        print("-" * 60)
        results[target] = {}

        # First check OPTIONS to see what server reports
        try:
            r = requests.options(target, headers=HEADERS, timeout=10, verify=False)
            allowed = r.headers.get("Allow", r.headers.get("Access-Control-Allow-Methods", "Not disclosed"))
            print(f"  OPTIONS -> {r.status_code} | Allow: {allowed}")
            results[target]["OPTIONS"] = {"status": r.status_code, "allow": allowed}
        except Exception as e:
            print(f"  OPTIONS -> ERROR: {str(e)[:60]}")

        # Test TRACE (cross-site tracing)
        try:
            r = requests.request("TRACE", target, headers=HEADERS, timeout=10, verify=False)
            flag = "[!] ENABLED - XST Risk!" if r.status_code == 200 else "[ok] Disabled"
            print(f"  TRACE  -> {r.status_code} {flag}")
            results[target]["TRACE"] = r.status_code
        except Exception as e:
            print(f"  TRACE  -> ERROR: {str(e)[:60]}")

        # Test PUT (file upload)
        try:
            r = requests.put(target, headers=HEADERS, data="test", timeout=10, verify=False)
            flag = "[!] DANGEROUS!" if r.status_code in [200, 201] else "[ok] Blocked"
            print(f"  PUT    -> {r.status_code} {flag}")
            results[target]["PUT"] = r.status_code
        except Exception as e:
            print(f"  PUT    -> ERROR: {str(e)[:60]}")

        # Test DELETE
        try:
            r = requests.delete(target, headers=HEADERS, timeout=10, verify=False)
            flag = "[!] DANGEROUS!" if r.status_code in [200, 204] else "[ok] Blocked"
            print(f"  DELETE -> {r.status_code} {flag}")
            results[target]["DELETE"] = r.status_code
        except Exception as e:
            print(f"  DELETE -> ERROR: {str(e)[:60]}")

    print(f"\n{'='*70}")
    print("[+] HTTP Method Test Complete")
    
    # Save results
    with open("http_methods_results.txt", "w") as f:
        f.write("UIDAI HTTP Method Test Results\n")
        f.write("="*60 + "\n\n")
        for target, methods in results.items():
            f.write(f"Target: {target}\n")
            for method, result in methods.items():
                f.write(f"  {method}: {result}\n")
            f.write("\n")
    print("[+] Saved to http_methods_results.txt")

if __name__ == "__main__":
    test_methods()
