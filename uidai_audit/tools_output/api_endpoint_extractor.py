"""
API Endpoint Extractor — Downloads main.dart.js and extracts API endpoints, secrets, tokens
"""
import requests
import re
import json

TARGET_JS = "https://bookappointment.uidai.gov.in/main.dart.js"

PATTERNS = {
    "API Endpoint": [
        r'https?://[a-zA-Z0-9\-\.]+\.uidai\.gov\.in[/a-zA-Z0-9\-_\?=&%]*',
        r'"(/api/[^"]{3,80})"',
        r"'(/api/[^']{3,80})'",
        r'"(/v\d+/[^"]{3,80})"',
    ],
    "Razorpay Key": [r'rzp_(live|test)_[A-Za-z0-9]+'],
    "JWT Token": [r'eyJ[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.?[A-Za-z0-9\-_.+/=]*'],
    "AWS Key": [r'AKIA[0-9A-Z]{16}'],
    "Secret/Token": [r'(?i)(secret|token|key|password|auth)\s*[=:]\s*["\']([^"\']{8,50})["\']'],
    "Internal URL": [r'http://[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}/[^\s"\'<>]{5,80}'],
    "IP Address": [r'\b(?:10|172\.(?:1[6-9]|2\d|3[01])|192\.168)\.\d{1,3}\.\d{1,3}\b'],
    "Email Address": [r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}'],
    "Phone Number": [r'(?<!\d)\d{10}(?!\d)'],
    "Base64 Secret": [r'[A-Za-z0-9+/]{40,}={0,2}'],
}

print("=" * 70)
print("UIDAI main.dart.js — API Endpoint & Secret Extractor")
print("=" * 70)
print(f"Downloading: {TARGET_JS}")

try:
    r = requests.get(TARGET_JS, timeout=60, stream=True)
    total = int(r.headers.get("content-length", 0))
    print(f"File size: {total/1024/1024:.2f} MB | Status: {r.status_code}")
    content = r.text
    print(f"Downloaded {len(content)} characters")
except Exception as e:
    print(f"Error: {e}")
    exit()

findings = {}
seen = set()

for category, pattern_list in PATTERNS.items():
    findings[category] = []
    for pattern in pattern_list:
        matches = re.findall(pattern, content)
        for m in matches:
            val = m if isinstance(m, str) else m[-1]
            val = val.strip()
            # Filter noise
            if len(val) < 8:
                continue
            if "w3.org" in val or "schema.org" in val:
                continue
            if val not in seen:
                seen.add(val)
                findings[category].append(val)

print("\n" + "=" * 70)
print("EXTRACTION RESULTS")
print("=" * 70)

interesting = {}
for category, items in findings.items():
    if items:
        # Only show truly interesting ones
        if category in ["API Endpoint", "Razorpay Key", "JWT Token", "AWS Key", "Internal URL", "IP Address", "Email Address"]:
            interesting[category] = items[:30]  # cap at 30 per category
            print(f"\n[{category}] — {len(items)} found:")
            for item in items[:30]:
                print(f"  {item}")

# Save full results
with open("api_endpoints_found.txt", "w") as f:
    f.write("UIDAI main.dart.js Extraction Results\n")
    f.write("=" * 60 + "\n\n")
    for cat, items in interesting.items():
        f.write(f"\n[{cat}]\n")
        for item in items:
            f.write(f"  {item}\n")

print(f"\n[+] Results saved to api_endpoints_found.txt")
