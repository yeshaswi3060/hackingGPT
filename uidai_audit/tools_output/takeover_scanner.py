"""
Live Host Resolver & Subdomain Takeover Scanner
Checks the 40 discovered subdomains for active web servers
and dangling CNAME records.
"""
import requests
import socket
import warnings
import concurrent.futures

warnings.filterwarnings('ignore')

with open("all_uidai_subdomains.txt", "r") as f:
    subdomains = [line.strip() for line in f if line.strip()]

TAKEOVER_SIGNATURES = [
    "NoSuchBucket", "There isn't a GitHub Pages site here", 
    "404 Web Site not found", "No such app",
    "The site you were looking for could not be found.",
    "Help Center Closed", "Oops - We didn't find your site."
]

live_hosts = []
potential_takeovers = []

def check_host(subdomain):
    result = {"subdomain": subdomain, "status": "Offline", "title": "", "cname": ""}
    
    # Check CNAME for Takeover
    try:
        # Very basic CNAME check using socket
        cname = socket.gethostbyname_ex(subdomain)[0]
        if cname != subdomain:
            result["cname"] = cname
    except Exception:
        pass
        
    # Check HTTP/HTTPS
    for scheme in ["https", "http"]:
        url = f"{scheme}://{subdomain}"
        try:
            r = requests.get(url, timeout=5, verify=False, allow_redirects=True)
            result["status"] = r.status_code
            
            # Simple title extraction
            title = ""
            if "<title>" in r.text.lower():
                try:
                    title = r.text.lower().split("<title>")[1].split("</title>")[0].strip()
                except:
                    pass
            result["title"] = title
            
            # Check for Takeover Signatures in body
            for sig in TAKEOVER_SIGNATURES:
                if sig.lower() in r.text.lower():
                    potential_takeovers.append(f"[!!!] TAKEOVER: {url} -> {sig}")
            
            # If HTTPS works, don't bother with HTTP
            break
        except Exception:
            pass
            
    return result

print("=" * 70)
print(f"SCANNING {len(subdomains)} SUBDOMAINS FOR LIVE HOSTS & TAKEOVERS")
print("=" * 70)

with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
    results = list(executor.map(check_host, subdomains))

print("\n[+] LIVE HOSTS FOUND:")
for res in results:
    if res["status"] != "Offline":
        live_hosts.append(res)
        print(f"  [{res['status']}] {res['subdomain']}")
        if res["title"]:
            print(f"      Title: {res['title']}")
        if res["cname"]:
            print(f"      CNAME: {res['cname']}")

print("\n[+] POTENTIAL SUBDOMAIN TAKEOVERS:")
if potential_takeovers:
    for t in potential_takeovers:
        print(f"  {t}")
else:
    print("  [-] None detected.")

# Save live hosts
with open("live_subdomains.txt", "w") as f:
    for h in live_hosts:
        f.write(f"{h['subdomain']}\n")

print(f"\nSaved {len(live_hosts)} live hosts to live_subdomains.txt")
