#!/usr/bin/env python3
"""
UIDAI Dart/Flutter JS Secret Extractor
Downloads Flutter JS chunks and extracts: API keys, endpoints, secrets, tokens
Passive recon tool - no modification of any data
"""

import requests
import re
import json
import time
from urllib.parse import urljoin

BASE_URL = "https://bookappointment.uidai.gov.in/"
OUTPUT_FILE = "dart_secrets_found.txt"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "*/*",
}

# Patterns to hunt for in compiled JS
SECRET_PATTERNS = {
    "API Key (generic)":    r'(?i)(api[_-]?key|apikey)["\s:=]+["\']([A-Za-z0-9_\-]{16,})["\']',
    "Bearer Token":         r'(?i)bearer\s+([A-Za-z0-9\-._~+/]+=*)',
    "Razorpay Key":         r'(?i)(rzp_(?:test|live)_[A-Za-z0-9]{14,})',
    "PayU Key":             r'(?i)(payu[_-]?key|merchant[_-]?key)["\s:=]+["\']([A-Za-z0-9]{8,})["\']',
    "API Endpoint URL":     r'https?://(?!(?:uidai\.gov\.in|razorpay\.com|google|fonts|cdn))[^\s"\'<>]{10,}',
    "Internal API Path":    r'/api/v\d+/[^\s"\'<>{},]{5,}',
    "JWT Token":            r'eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}',
    "Email address":        r'[a-zA-Z0-9._%+\-]+@(?!example|test|email)[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}',
    "IP Address (private)": r'(?:10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)\d{1,3}\.\d{1,3}',
    "Hardcoded Password":   r'(?i)(password|passwd|secret|token)["\s:=]+["\']([^\s"\']{8,})["\']',
    "AWS Key":              r'(?i)(AKIA[0-9A-Z]{16})',
    "Google API Key":       r'AIza[0-9A-Za-z\-_]{35}',
    "Private Key Header":   r'-----BEGIN (?:RSA |EC )?PRIVATE KEY-----',
}

def fetch_service_worker():
    """Get list of all JS files from service worker"""
    print("[*] Fetching service worker manifest...")
    r = requests.get(urljoin(BASE_URL, "flutter_service_worker.js"), headers=HEADERS, timeout=15)
    # Extract all .js filenames
    js_files = re.findall(r'"(main\.dart\.js(?:_\d+\.part\.js)?)"', r.text)
    print(f"[+] Found {len(js_files)} JS files to analyze")
    return js_files

def extract_secrets_from_content(content, filename):
    """Scan content for secrets and return findings"""
    findings = []
    for pattern_name, pattern in SECRET_PATTERNS.items():
        matches = re.findall(pattern, content)
        if matches:
            for match in matches[:5]:  # Cap at 5 per pattern per file
                match_str = match if isinstance(match, str) else " | ".join(match)
                if len(match_str) > 8:  # filter noise
                    findings.append({
                        "file": filename,
                        "type": pattern_name,
                        "value": match_str[:200]  # truncate for safety
                    })
    return findings

def main():
    all_findings = []
    
    print(f"\n{'='*60}")
    print("  UIDAI Flutter App Secret Extractor")
    print(f"  Target: {BASE_URL}")
    print(f"{'='*60}\n")

    # Fetch main dart.js (largest file, most likely to have secrets)
    priority_files = [
        "main.dart.js",
        "main.dart.js_1.part.js",
        "main.dart.js_2.part.js",
        "main.dart.js_3.part.js",
        "main.dart.js_4.part.js",
    ]

    for filename in priority_files:
        url = urljoin(BASE_URL, filename)
        print(f"[*] Downloading {filename}...")
        try:
            r = requests.get(url, headers=HEADERS, timeout=30)
            if r.status_code == 200:
                print(f"    Size: {len(r.content):,} bytes")
                findings = extract_secrets_from_content(r.text, filename)
                if findings:
                    print(f"    [!] {len(findings)} potential findings!")
                    all_findings.extend(findings)
                else:
                    print(f"    [ok] No obvious secrets found")
            else:
                print(f"    [!] HTTP {r.status_code}")
        except Exception as e:
            print(f"    [err] {e}")
        time.sleep(0.5)

    # Write results
    print(f"\n{'='*60}")
    print(f"[+] Total findings: {len(all_findings)}")
    
    with open(OUTPUT_FILE, "w") as f:
        f.write("UIDAI Flutter JS Secret Extraction Results\n")
        f.write("="*60 + "\n\n")
        
        if not all_findings:
            f.write("No obvious hardcoded secrets found in priority JS files.\n")
            f.write("Recommendation: Use a decompiler (jadx/dart2js) for deeper analysis.\n")
        else:
            for i, finding in enumerate(all_findings, 1):
                f.write(f"[{i}] Type: {finding['type']}\n")
                f.write(f"    File: {finding['file']}\n")
                f.write(f"    Value: {finding['value']}\n\n")
    
    print(f"[+] Results written to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
