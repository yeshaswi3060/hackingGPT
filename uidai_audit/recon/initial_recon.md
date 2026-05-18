# UIDAI Passive Recon — Initial Results
**Date:** 2026-04-27  
**Method:** Passive only (no active probing)  
**Target:** https://uidai.gov.in/en/

---

## 1. HTTP Response & Basic Checks

| Check | URL | Result |
|-------|-----|--------|
| Homepage | https://uidai.gov.in/en/ | ✅ 200 OK |
| robots.txt | https://uidai.gov.in/robots.txt | ❌ 404 MISSING |
| sitemap.xml | https://uidai.gov.in/sitemap.xml | ❌ 404 MISSING |
| security.txt | https://uidai.gov.in/.well-known/security.txt | ❌ 404 MISSING |

---

## 2. Subdomains Discovered (from homepage links)

| Subdomain | Status | Notes |
|-----------|--------|-------|
| `myaadhaar.uidai.gov.in` | ✅ Active | OTP-based auth portal — high value target |
| `bookappointment.uidai.gov.in` | ✅ Linked | Appointment booking system |
| `appointments.uidai.gov.in` | ✅ Linked | Enrolment center search |
| `pehchaan.uidai.gov.in` | ✅ Linked | Aadhaar mobile app download |
| `bhuvan.nrsc.gov.in` | ℹ️ External | NRSC map portal — out of scope |
| `resident.uidai.gov.in` | ❌ DNS FAIL | **No DNS record — possible dangling subdomain** |

---

## 3. Findings (Passive Only)

### FINDING-001 — Missing security.txt
- **Severity:** 🟠 HIGH  
- **URL:** `https://uidai.gov.in/.well-known/security.txt`
- **Expected:** RFC 9116 compliant security.txt with contact, policy, and encryption info
- **Found:** HTTP 404
- **Impact:** No official vulnerability disclosure contact published. Violates NCIIPC/CERT-In guidelines for government websites.
- **Reference:** https://www.rfc-editor.org/rfc/rfc9116

### FINDING-002 — Missing robots.txt
- **Severity:** 🟡 MEDIUM  
- **URL:** `https://uidai.gov.in/robots.txt`
- **Found:** HTTP 404
- **Impact:** No crawl restrictions defined. All site paths indexable by search engines. Admin/internal paths may appear in Google cache.

### FINDING-003 — Missing sitemap.xml
- **Severity:** 🟡 LOW  
- **URL:** `https://uidai.gov.in/sitemap.xml`
- **Impact:** Informational — missing sitemap means incomplete SEO hygiene and no formal page map.

### FINDING-004 — Dangling DNS: resident.uidai.gov.in
- **Severity:** 🔴 CRITICAL (needs verification)
- **URL:** `https://resident.uidai.gov.in/`
- **Found:** DNS lookup fails — `no such host`
- **Impact:** If a CNAME or A record exists pointing to a decommissioned service (e.g., old Azure/Heroku/S3 endpoint), this is a **subdomain takeover** vulnerability.
- **Next Step:** Run `dig resident.uidai.gov.in` and `nslookup resident.uidai.gov.in` to confirm DNS state. If CNAME points to unclaimed resource → report immediately.

---

## 4. Tech Stack (from page source)
- CMS: Custom / Joomla-based government portal
- Language: Multilingual (EN/HI)
- External subdomains: myaadhaar (React app), bookappointment (ASP.NET?)
- CDN: Not immediately obvious — needs header inspection

---

## 5. Next Steps for Tool-Based Testing

Run these commands and save output to `tools_output/` folder:

```bash
# 1. Check HTTP headers
curl -I https://uidai.gov.in/en/ > tools_output/headers_main.txt

# 2. Check myaadhaar headers
curl -I https://myaadhaar.uidai.gov.in/ > tools_output/headers_myaadhaar.txt

# 3. DNS check on dangling subdomain
nslookup resident.uidai.gov.in > tools_output/dns_resident.txt
dig resident.uidai.gov.in CNAME > tools_output/dig_resident.txt

# 4. Subdomain enumeration (once subfinder installed)
subfinder -d uidai.gov.in -o tools_output/subdomains.txt

# 5. HTTP probe all subdomains
httpx -l tools_output/subdomains.txt -sc -title -tech-detect -o tools_output/httpx_results.txt

# 6. Nuclei passive scan (safe templates only)
nuclei -u https://uidai.gov.in -t exposures/ -t misconfiguration/ -o tools_output/nuclei_results.txt
```
