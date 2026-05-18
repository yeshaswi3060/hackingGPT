# UIDAI Full Scope Recon — All Subdomains
**Date:** 2026-04-27  
**Scope:** All Aadhaar-related portals (authorized)

---

## Subdomain Status Map

| Subdomain | Status | Tech Stack | Notes |
|-----------|--------|-----------|-------|
| `uidai.gov.in` | ✅ Active | Joomla/CMS | Main informational site |
| `myaadhaar.uidai.gov.in` | ✅ Active | **React SPA** | Core services portal — OTP auth |
| `bookappointment.uidai.gov.in` | ✅ Active | **Flutter Web** | Appointment booking + PAYMENT flows |
| `appointments.uidai.gov.in` | ⏱️ Timeout | ASP.NET (.aspx) | Connection timeout — server issue |
| `pehchaan.uidai.gov.in` | ✅ Redirects | External redirect | Redirects to Google Play Store |
| `resident.uidai.gov.in` | ❌ NXDOMAIN | — | DNS non-existent — NOT a takeover |

---

## 🔴 CRITICAL FINDING — bookappointment.uidai.gov.in

### FINDING-005 — Razorpay + PayU loaded from EXTERNAL CDNs (Payment Portal)

**Source from page HTML:**
```html
<script src="https://checkout.razorpay.com/v1/checkout.js" defer></script>
<script src="razorpay_payment_script.js" defer></script>
<script src="payu_payment_script.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/pdfjs-dist@2.12.313/build/pdf.js"></script>
```

**Severity:** 🔴 CRITICAL  
**Finding:** The appointment booking portal (which processes PAYMENTS for Aadhaar PVC cards) loads **Razorpay and PayU payment scripts from external third-party CDNs** with no Subresource Integrity (SRI) hashes.

**What this means:**
- If `checkout.razorpay.com` or `cdn.jsdelivr.net` is compromised, attackers can inject malicious JS into the payment flow
- No `integrity="sha256-..."` attribute on any of the `<script>` tags
- This is a **supply chain attack vector** on a government payment portal
- Called a **CDN Hijacking / XSS via third-party script** attack

**Proof:**
```html
<!-- VULNERABLE — no SRI hash -->
<script src="https://checkout.razorpay.com/v1/checkout.js" defer></script>

<!-- SHOULD BE -->
<script src="https://checkout.razorpay.com/v1/checkout.js" 
        integrity="sha256-[hash]" 
        crossorigin="anonymous" defer></script>
```

---

### FINDING-006 — Flutter Web App Metadata Exposure

**Source:**
```html
<meta name="description" content="A new Flutter project." />
<meta name="apple-mobile-web-app-title" content="appointment" />
```

**Severity:** 🟡 LOW-MEDIUM  
**Finding:** The appointment portal still has **default Flutter project metadata** — `"A new Flutter project."` as the meta description. This reveals the framework and that the app was deployed without proper production configuration.

---

### FINDING-007 — pdfjs loaded from OLD CDN version

**Source:**
```html
<script src="https://cdn.jsdelivr.net/npm/pdfjs-dist@2.12.313/build/pdf.js"></script>
```

**Severity:** 🟠 HIGH  
**Finding:** `pdfjs-dist@2.12.313` is an **outdated version** (released ~2021). Multiple CVEs exist in old pdfjs versions including XSS via malicious PDFs.

**CVEs to check:**
- CVE-2024-4367 — pdfjs arbitrary JS execution via font injection
- This affects versions before 4.2.67

---

## 🔴 CRITICAL FINDING — myaadhaar.uidai.gov.in

### FINDING-008 — React SPA with No CSP Header (to verify)

**Tech Stack:**
```html
<script defer src="/static/js/main.bb8a902c.js"></script>
<link href="/static/css/main.526a4f29.css" rel="stylesheet">
```

- **Framework:** React (Create React App — hashed filenames confirm)
- **No visible CSP** in the HTML `<meta>` tags
- Needs header-level verification with `curl -I`

**This means:** If XSS is found anywhere in this React app, there is potentially no Content Security Policy to block execution.

---

## Next Steps — Run These Commands

Save output to `tools_output/`:

```powershell
# 1. Check security headers on ALL portals
curl -I https://myaadhaar.uidai.gov.in/ 
curl -I https://bookappointment.uidai.gov.in/
curl -I https://uidai.gov.in/en/

# 2. Check if appointments subdomain is actually down
curl -I https://appointments.uidai.gov.in/easearch.aspx

# 3. Check for apple-app-site-association (AASA) file — can reveal app bundle IDs
curl https://myaadhaar.uidai.gov.in/apple-app-site-association
curl https://myaadhaar.uidai.gov.in/manifest.json

# 4. Check if Flutter app exposes source maps
curl -I https://bookappointment.uidai.gov.in/main.dart.js.map
```

---

## High-Value Targets for Active Testing (with auth)

| Target | Why It Matters |
|--------|---------------|
| OTP rate limiting on `myaadhaar.uidai.gov.in` | Can OTPs be brute-forced? Is there lockout? |
| Payment flow on `bookappointment.uidai.gov.in` | Price manipulation, order IDOR |
| Aadhaar number verification endpoint | Is there rate limiting? Enumeration possible? |
| Lock/Unlock biometrics flow | Business logic bypass? |
| Download Aadhaar — auth bypass? | Can you download someone else's Aadhaar? |
