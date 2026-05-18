"""
Secret Hunter for Staging React Application
Downloads the main JS bundle from myaadhaarstage and scans for secrets.
"""
import requests
import re
import warnings

warnings.filterwarnings('ignore')

URL = "https://myaadhaarstage.uidai.gov.in/static/js/main.52c938e2.js"

print("=" * 70)
print(f"ANALYZING STAGING BUNDLE: {URL}")
print("=" * 70)

try:
    r = requests.get(URL, timeout=15, verify=False)
    if r.status_code == 200:
        content = r.text
        print(f"[+] Downloaded successfully. Size: {len(content)} bytes")
        
        # Regex patterns for secrets and API keys
        patterns = {
            "Razorpay Key": r"(rzp_(live|test)_[a-zA-Z0-9]+)",
            "Generic API Key": r"['\"]([A-Za-z0-9-_]{32,})['\"]",
            "Internal API Endpoints": r"https?://([a-zA-Z0-9\-\.]+\.uidai\.gov\.in[a-zA-Z0-9\-\./]+)",
            "Auth Tokens (Bearer)": r"Bearer\s+([A-Za-z0-9\-_\.]+)",
            "Client Secret": r"client_secret['\"\s:]+['\"]([^'\"]+)['\"]",
            "Localhost/Dev Endpoints": r"http://(?:localhost|127\.0\.0\.1)[a-zA-Z0-9\-\./]+"
        }
        
        for name, pattern in patterns.items():
            print(f"\n[*] Hunting for {name}...")
            matches = set(re.findall(pattern, content))
            
            if matches:
                # Handle tuple returns from regex groups
                if name == "Razorpay Key":
                    cleaned_matches = [m[0] for m in matches]
                else:
                    cleaned_matches = list(matches)
                    
                # Print up to 10 unique findings per category
                for match in cleaned_matches[:10]:
                    print(f"  [!] FOUND: {match}")
                
                if len(cleaned_matches) > 10:
                    print(f"  ... and {len(cleaned_matches) - 10} more.")
            else:
                print("  [-] None found.")
                
    else:
        print(f"[-] Failed to fetch bundle. Status Code: {r.status_code}")
except Exception as e:
    print(f"[!] Error: {e}")
