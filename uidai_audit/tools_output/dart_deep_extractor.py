"""
Deep Dart JS Part Analyzer — Downloads ALL 127 Dart JS parts and extracts
every API endpoint, secret, token, and internal path
"""
import requests
import re
import warnings
warnings.filterwarnings('ignore')

BASE = "https://bookappointment.uidai.gov.in"

# All 127 part file names from service worker
PARTS = [f"main.dart.js_{i}.part.js" for i in range(1, 128)]
PARTS.insert(0, "main.dart.js")  # main file too

PATTERNS = {
    "uidai_api_url": re.compile(r'https?://[a-zA-Z0-9\-\.]+\.uidai\.(?:gov|net)\.in[/a-zA-Z0-9\-_\.%?=&]*', re.IGNORECASE),
    "api_path": re.compile(r'["\'](/[a-zA-Z0-9/_\-\.%]{5,80})["\']'),
    "razorpay_live": re.compile(r'rzp_live_[A-Za-z0-9]+'),
    "razorpay_test": re.compile(r'rzp_test_[A-Za-z0-9]+'),
    "razorpay_secret": re.compile(r'(?:razorpay|rpay)[-_\s]*(?:secret|key)[-_\s]*[=:]\s*["\']([A-Za-z0-9]+)["\']', re.IGNORECASE),
    "jwt_token": re.compile(r'eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+'),
    "aws_key": re.compile(r'AKIA[0-9A-Z]{16}'),
    "bearer_token": re.compile(r'Bearer\s+([A-Za-z0-9\-_\.]+)'),
    "basic_auth": re.compile(r'Basic\s+([A-Za-z0-9+/=]{20,})'),
    "private_key": re.compile(r'-----BEGIN [A-Z ]+PRIVATE KEY-----'),
    "password_field": re.compile(r'(?:password|passwd|secret|apikey|api_key|auth_token|access_token)["\'\s]*[:=]["\'\s]*([A-Za-z0-9@#$%^&*\-_\.]{8,50})', re.IGNORECASE),
    "internal_ip": re.compile(r'(?:10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)\d{1,3}\.\d{1,3}'),
    "internal_host": re.compile(r'["\']([a-z][a-z0-9\-]*(?:internal|local|private|staging|stage|dev|test|admin|backoffice|mgmt|management)[a-z0-9\-]*\.[a-z]{2,})["\']', re.IGNORECASE),
    "email": re.compile(r'[a-zA-Z0-9._%+\-]+@(?:uidai|gov|nic)\.(?:gov\.in|net\.in|in)'),
    "otp_endpoint": re.compile(r'["\']([^"\']*(?:otp|auth|verify|login|token|session)[^"\']*)["\']', re.IGNORECASE),
}

found = {k: set() for k in PATTERNS}
files_downloaded = 0

print("=" * 70)
print("DART JS DEEP EXTRACTOR — All Parts")
print("=" * 70)

# Sample strategically: main + parts 1-10, then every 10th after
to_download = ["main.dart.js"] + [f"main.dart.js_{i}.part.js" for i in list(range(1,20)) + list(range(20,128,5))]

for filename in to_download:
    url = f"{BASE}/{filename}"
    try:
        r = requests.get(url, timeout=30, headers={'User-Agent': 'Mozilla/5.0'})
        if r.status_code == 200:
            content = r.text
            files_downloaded += 1
            print(f"  [+] {filename} ({len(content)//1024}KB)", end=" ")
            
            hits = 0
            for key, pattern in PATTERNS.items():
                matches = pattern.findall(content)
                for m in matches:
                    val = m if isinstance(m, str) else m[0] if m else ""
                    val = val.strip()
                    if len(val) > 4 and val not in ['self', 'null', 'true', 'false']:
                        # Filter noise
                        if key == "api_path" and any(x in val for x in ['.png','.jpg','.css','.js','.gif','.svg','.woff','.ttf','.ico']):
                            continue
                        if key == "api_path" and len(val) < 8:
                            continue
                        found[key].add(val)
                        hits += 1
            print(f"— {hits} hits")
    except Exception as e:
        print(f"  [-] {filename}: {e}")

print(f"\n{'='*70}")
print(f"EXTRACTION COMPLETE — {files_downloaded} files analyzed")
print(f"{'='*70}")

# Report findings
with open("dart_deep_extraction.txt", "w", encoding="utf-8") as f:
    for category, values in found.items():
        if values:
            # Filter out common noise
            clean = set()
            for v in values:
                if category == "api_path":
                    # Only show meaningful API-like paths
                    if any(x in v.lower() for x in ['/api', '/v1', '/v2', '/auth', '/otp', '/verify', '/aadhaar', '/resident', '/appointment', '/payment', '/user', '/admin', '/login', '/token', '/session', '/biometric', '/kyc', '/lock', '/unlock', '/download', '/generate', '/enroll', '/update', '/health', '/status', '/ogs', '/gateway']):
                        clean.add(v)
                else:
                    clean.add(v)
            
            if clean:
                print(f"\n[{category.upper()}] — {len(clean)} unique values:")
                f.write(f"\n\n[{category.upper()}]\n")
                for v in sorted(clean):
                    print(f"  {v}")
                    f.write(f"  {v}\n")

print(f"\n[+] Full results saved to dart_deep_extraction.txt")
