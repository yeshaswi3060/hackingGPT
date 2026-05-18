"""
Extract real API paths from Dart JS that tathyamndc.uidai.gov.in serves
Then probe ALL of them to find live endpoints returning real data
"""
import requests
import re
import warnings
warnings.filterwarnings('ignore')

# Already extracted from main.dart.js — now let's find the actual API routes
# by searching for tathyamndc-specific paths in the compiled JS

BACKEND = "https://tathyamndc.uidai.gov.in"

# Common API path patterns for this type of government appointment system
# Based on the app functionality: booking, payment, Aadhaar verification
API_PATHS_TO_TEST = [
    # Appointment APIs
    "/appointment/v1/", "/appointment/v2/",
    "/appointment/create", "/appointment/cancel",
    "/appointment/reschedule", "/appointment/status",
    "/appointment/list", "/appointment/details",
    "/appointment/slots", "/appointment/centers",
    "/appointment/search", "/appointment/check",
    
    # OGS (Online Gateway Service) paths — from error code OGS-GEN-004
    "/ogs/", "/ogs/v1/", "/ogs/v2/",
    "/ogs/appointment", "/ogs/payment",
    "/ogs/auth", "/ogs/validate",
    
    # Payment APIs
    "/payment/v1/", "/payment/create",
    "/payment/verify", "/payment/status",
    "/payment/callback", "/payment/refund",
    
    # Auth/OTP APIs
    "/auth/", "/auth/otp", "/auth/verify",
    "/auth/token", "/auth/refresh",
    "/otp/generate", "/otp/validate",
    
    # Resident APIs
    "/resident/", "/resident/v1/",
    "/resident/verify", "/resident/details",
    
    # Aadhaar APIs
    "/aadhaar/verify", "/aadhaar/validate",
    "/aadhaar/lock", "/aadhaar/unlock",
    "/aadhaar/download", "/aadhaar/generate-otp",
    
    # Generic REST patterns
    "/api/", "/api/v1/", "/api/v2/",
    "/v1/", "/v2/", "/v3/",
    "/health", "/health/", "/ping",
    "/actuator/", "/manage/",
    "/info", "/status",
    
    # Center/location APIs (common in appointment systems)
    "/center/search", "/center/list",
    "/state/list", "/district/list",
    "/pincode/search",
    
    # User APIs
    "/user/", "/user/profile", "/user/create",
    
    # Admin APIs that might be accidentally exposed
    "/admin/", "/admin/api/",
    "/management/", "/internal/",
    
    # Swagger/docs
    "/swagger-ui.html", "/swagger-ui/",
    "/v3/api-docs", "/v2/api-docs",
    "/api-docs", "/openapi.yaml",
    "/graphql",
]

print("=" * 70)
print(f"TATHYAMNDC API PATH PROBER — {BACKEND}")
print("=" * 70)
print(f"Testing {len(API_PATHS_TO_TEST)} paths")
print()

findings = []

for path in API_PATHS_TO_TEST:
    url = BACKEND + path
    try:
        r = requests.get(
            url, timeout=8,
            headers={
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            allow_redirects=False
        )
        
        status = r.status_code
        size = len(r.content)
        ct = r.headers.get('Content-Type', '')
        body = r.text[:300]
        
        # Skip the standard 500 gateway error (that's the default for everything)
        # Look for DIFFERENT responses that indicate a real endpoint
        
        is_interesting = False
        reason = ""
        
        if status in [200, 201, 202]:
            is_interesting = True
            reason = f"SUCCESS! {size} bytes"
        elif status == 401:
            is_interesting = True
            reason = "AUTH REQUIRED — endpoint exists and requires auth"
        elif status == 403:
            is_interesting = True
            reason = "FORBIDDEN — endpoint exists"
        elif status == 405:
            is_interesting = True
            reason = "METHOD NOT ALLOWED — endpoint exists, try POST"
        elif status == 400:
            is_interesting = True
            reason = "BAD REQUEST — endpoint exists, needs params"
        elif status == 404:
            pass  # truly doesn't exist
        elif status == 500 and 'OGS-GEN-004' not in body:
            is_interesting = True
            reason = f"DIFFERENT 500 ERROR — not the gateway catch-all"
        elif status == 555:
            is_interesting = True
            reason = "555 WAF BLOCK — specifically blocked (sensitive!)"
        
        if is_interesting:
            print(f"  [!!!] [{status}] {url}")
            print(f"        {reason}")
            if size < 2000:
                print(f"        Body: {body[:200]}")
            findings.append({
                "url": url,
                "status": status,
                "size": size,
                "reason": reason,
                "body_preview": body[:200]
            })
    except requests.exceptions.Timeout:
        pass
    except Exception as e:
        pass

print(f"\n{'='*70}")
print(f"RESULTS: {len(findings)} interesting endpoints found")
for f in findings:
    print(f"\n  [{f['status']}] {f['url']}")
    print(f"  Reason: {f['reason']}")
    if f['body_preview']:
        print(f"  Body: {f['body_preview'][:150]}")

with open("tathyamndc_endpoints.txt", "w", encoding="utf-8") as out:
    out.write(f"tathyamndc.uidai.gov.in API Endpoint Discovery\n{'='*60}\n\n")
    for f in findings:
        out.write(f"[{f['status']}] {f['url']}\n")
        out.write(f"Reason: {f['reason']}\n")
        out.write(f"Body: {f['body_preview']}\n\n")
print("\n[+] Saved to tathyamndc_endpoints.txt")
