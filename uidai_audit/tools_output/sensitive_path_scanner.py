"""
Sensitive Path Scanner — Checks for exposed admin, API, backup, and dev files
"""
import requests
import time

TARGETS = [
    "https://myaadhaar.uidai.gov.in",
    "https://bookappointment.uidai.gov.in",
    "https://uidai.gov.in",
]

# Focused on HIGH-VALUE paths for a government/payment site
PATHS = [
    # API/Backend endpoints
    "/api/", "/api/v1/", "/api/v2/", "/api/health", "/api/status",
    "/api/user", "/api/users", "/api/admin", "/api/config",
    "/graphql", "/graphiql", "/playground",
    "/swagger", "/swagger.json", "/swagger/index.html",
    "/openapi.json", "/api-docs", "/docs",
    "/v1/", "/v2/",
    
    # Admin panels
    "/admin", "/admin/", "/administrator", "/admin/login",
    "/admin/dashboard", "/panel", "/cpanel", "/wp-admin",
    "/manage", "/management", "/console",
    "/phpmyadmin", "/pma", "/phpinfo.php",
    
    # Auth/Login endpoints
    "/login", "/signin", "/auth", "/auth/login",
    "/oauth/token", "/oauth/authorize",
    "/sso", "/sso/login", "/saml", "/saml/sso",
    
    # Sensitive files
    "/.env", "/.env.production", "/.env.local",
    "/config.json", "/config.yml", "/config.yaml",
    "/settings.json", "/appsettings.json",
    "/web.config", "/app.config",
    "/.git/HEAD", "/.git/config",
    "/package.json", "/package-lock.json",
    "/composer.json", "/requirements.txt",
    "/Dockerfile", "/docker-compose.yml",
    
    # Backup files
    "/backup.zip", "/backup.tar.gz", "/dump.sql",
    "/db.sql", "/database.sql", "/site.zip",
    
    # Debug/Dev
    "/debug", "/trace", "/health", "/healthz",
    "/status", "/metrics", "/actuator",
    "/actuator/health", "/actuator/env", "/actuator/beans",
    "/actuator/mappings", "/actuator/info",
    "/.well-known/", "/.well-known/openid-configuration",
    "/.well-known/oauth-authorization-server",
    "/.well-known/jwks.json",
    
    # Flutter/Dart specific
    "/main.dart.js", "/flutter_service_worker.js",
    "/assets/AssetManifest.json", "/assets/FontManifest.json",
    "/version.json", "/manifest.json",
    "/assets/lib/.env", "/assets/config.json",
    
    # Joomla specific (uidai.gov.in is Joomla)
    "/administrator/", "/administrator/index.php",
    "/joomla.xml", "/configuration.php",
    "/joomla/", "/components/", "/modules/",
    
    # Log files
    "/logs/", "/log/", "/error.log", "/access.log",
    "/debug.log", "/application.log",
]

print("=" * 70)
print("SENSITIVE PATH SCANNER — UIDAI Portals")
print("=" * 70)

findings = []

for base in TARGETS:
    print(f"\n[TARGET] {base}")
    for path in PATHS:
        url = base.rstrip("/") + path
        try:
            r = requests.get(url, timeout=8, allow_redirects=False,
                           headers={"User-Agent": "Mozilla/5.0"})
            size = len(r.content)
            
            # Interesting responses: 200 (not the default SPA shell), 301, 302, 403
            if r.status_code == 200 and size > 100 and size != 1160 and size != 2490:
                tag = f"[!!!] 200 OK — {size} bytes — INVESTIGATE!"
                findings.append(f"200 OK: {url} ({size} bytes)")
                print(f"  {tag} {url}")
            elif r.status_code == 401:
                tag = f"[!] 401 AUTH REQUIRED — endpoint exists!"
                findings.append(f"401: {url} — auth-protected endpoint exists")
                print(f"  {tag} {url}")
            elif r.status_code == 403:
                tag = f"[!] 403 FORBIDDEN — endpoint exists but blocked"
                findings.append(f"403: {url}")
                print(f"  {tag} {url}")
            elif r.status_code in [301, 302]:
                loc = r.headers.get("Location", "")
                if "http" in loc.lower() and base.split("/")[2] not in loc:
                    tag = f"[!] EXTERNAL REDIRECT: {loc}"
                    findings.append(f"EXTERNAL REDIRECT: {url} → {loc}")
                    print(f"  {tag}")
            # else: 404 or SPA-default, skip
        except requests.exceptions.ConnectionError:
            pass
        except requests.exceptions.Timeout:
            pass
        except Exception as e:
            pass
        
        time.sleep(0.1)  # be polite — don't hammer the server

print(f"\n{'='*70}")
print(f"FINDINGS: {len(findings)} interesting paths")
for f in findings:
    print(f"  [!] {f}")

with open("path_scan_results.txt", "w") as f:
    f.write("Sensitive Path Scan Results\n" + "="*60 + "\n\n")
    for finding in findings:
        f.write(f"[!] {finding}\n")
print("\n[+] Saved to path_scan_results.txt")
