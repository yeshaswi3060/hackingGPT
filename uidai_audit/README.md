# 🛡️ UIDAI Security Audit Workspace
**Target:** https://uidai.gov.in/en/  
**Authorization:** Government Bug Bounty Program (NCIIPC/CERT-In)  
**Scope:** uidai.gov.in (public-facing only)  
**Audit Type:** Passive + Authorized Active Testing  
**Started:** 2026-04-27  

---

## 📁 Folder Structure

| Folder | Purpose |
|--------|---------|
| `recon/` | Passive reconnaissance notes, DNS, headers, subdomain maps |
| `findings/` | Documented vulnerabilities with severity ratings |
| `screenshots/` | Browser screenshots as proof |
| `tools_output/` | Raw output from tools (nuclei, nikto, ffuf, etc.) |

---

## 🔒 Rules of Engagement

- ✅ Passive recon only unless authorized active testing confirmed
- ✅ No injection of payloads into live user data
- ✅ No access to real Aadhaar numbers or PII
- ✅ No DoS or availability-affecting tests
- ✅ Document everything before reporting
- ❌ Do NOT test out-of-scope subdomains

---

## 📋 Confirmed In-Scope
- `https://uidai.gov.in/en/`

## ❓ Confirm Before Testing
- `myaadhaar.uidai.gov.in` — check your auth doc
- `bookappointment.uidai.gov.in` — check your auth doc
- `appointments.uidai.gov.in` — check your auth doc
- `pehchaan.uidai.gov.in` — check your auth doc

---

## 🛠️ Suggested Tools to Install

```
# Recon
amass           → subdomain enumeration
subfinder       → fast subdomain discovery
httpx           → HTTP probing (status, headers, tech)
dnsx            → DNS validation

# Vulnerability Scanning
nuclei          → template-based vuln scanner (PASSIVE safe mode)
nikto           → web server misconfiguration scanner
whatweb         → tech fingerprinting

# Directory/Endpoint Discovery  
ffuf            → fast fuzzing (directories, parameters)
katana          → web crawler / endpoint mapper

# Header Analysis
curl            → manual header inspection (already installed)
```

Install with:
```bash
# Go-based tools (install Go first)
go install github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest
go install github.com/projectdiscovery/httpx/cmd/httpx@latest
go install github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest
go install github.com/projectdiscovery/katana/cmd/katana@latest
go install github.com/ffuf/ffuf/v2@latest
```
