# 🔐 Security Audit Report — Mango Tree Technology
**Target:** https://www.mangotreetechnology.com  
**Audit Type:** Passive / Black-box Reconnaissance  
**Date:** 2026-04-26  
**Auditor:** Antigravity AI Security Audit  
**Scope:** Full website surface audit (OSINT, headers, JS analysis, DNS, path probing, form analysis)

---

## Executive Summary

Mango Tree Technology's website presents a **medium-to-high risk surface** for a company offering **cybersecurity services** to enterprise clients. While infrastructure-level hardening is decent (Cloudflare CDN, HSTS), the application layer has **critical issues** including sensitive file exposure, unprotected form submission to a third-party PHP server, missing Content Security Policy, and significant information disclosure. A company claiming to offer "cybersecurity management" should lead by example — the current state does not reflect that.

**Overall Risk Rating: 🟠 MEDIUM-HIGH**

---

## 1. Infrastructure & DNS Analysis

### 1.1 Hosting Stack
| Component | Value |
|-----------|-------|
| CDN | Cloudflare (masks real origin IP) |
| Nameservers | `alexa.ns.cloudflare.com`, `julian.ns.cloudflare.com` |
| Origin IPs (Cloudflare edge) | `104.21.42.8`, `2606:4700:3033::6815:2a08` |
| Email Provider | **Hostinger** (`mx1.hostinger.com`, `mx2.hostinger.com`) |
| Web Framework | **Static HTML** (served via `npx serve`) |
| Server Header | `cloudflare` (origin masked) |

### 1.2 DNS Records Found
| Type | Value | Risk |
|------|-------|------|
| SPF TXT | `v=spf1 include:_spf.mail.hostinger.com ~all` | ⚠️ Uses `~all` (SoftFail) not `-all` (HardFail) |
| Google Verification | `google-site-verification=03nk3z...` | Informational |
| Unknown TXT | `_yk3wu2kh0pbz71h3roo2cv23cqcrn9t` | Possible orphaned 3rd-party token |
| Unknown TXT | `_jfta1aapte0c5o8z8ilbneqkvt9hvqr` | Possible orphaned 3rd-party token |
| MX | Hostinger mail servers | Informational |

> [!WARNING]
> **SPF SoftFail (`~all`)**: Using `~all` means emails that fail SPF are NOT rejected — they are only marked. An attacker can spoof `@mangotreetechnology.com` email addresses and most mail servers will still deliver them. This enables **phishing and business email compromise (BEC)** attacks impersonating this company to clients.

> [!NOTE]
> Two unknown TXT records are present that could be verification tokens for unrecognized/old third-party services. These should be audited and removed if no longer needed.

---

## 2. HTTP Security Headers Analysis

Audit performed via direct HTTP HEAD request to `/index`.

| Header | Value | Status |
|--------|-------|--------|
| `Strict-Transport-Security` | `max-age=10886400; includeSubDomains; preload` | ✅ Present |
| `X-Content-Type-Options` | `nosniff` | ✅ Present |
| `X-XSS-Protection` | `1; mode=block` | ✅ Present (legacy) |
| `Referrer-Policy` | `same-origin` | ✅ Present |
| `X-DNS-Prefetch-Control` | `off` | ✅ Present |
| `X-Frame-Options` | **MISSING** | ❌ **VULNERABLE to Clickjacking** |
| `Content-Security-Policy` | **MISSING** | ❌ **CRITICAL — XSS amplification** |
| `Permissions-Policy` | **MISSING** | ❌ Missing |
| `Cross-Origin-Opener-Policy` | **MISSING** | ❌ Missing |
| `Cross-Origin-Embedder-Policy` | **MISSING** | ❌ Missing |
| `Server` | `cloudflare` | ✅ Origin hidden |
| `Cache-Control` | `public, must-revalidate, max-age=30` | ⚠️ Login page should be `no-store` |
| `Set-Cookie` | **No cookies set on login page** | ⚠️ No visible session management |

> [!CAUTION]
> **Missing Content-Security-Policy (CSP)**: Without CSP, any successful XSS injection can execute arbitrary JavaScript with no browser-level mitigation. The site loads 30+ third-party JS libraries — a very large attack surface. This is the single most impactful missing header.

> [!WARNING]
> **Missing X-Frame-Options**: The site can be embedded in an `<iframe>` on any attacker-controlled domain, enabling **clickjacking attacks** — tricking users into clicking invisible buttons on the Mango Tree site.

> [!WARNING]
> **Login Page Cache-Control**: The `/login` page is served with `Cache-Control: public`. Login pages must use `Cache-Control: no-store, no-cache` to prevent credentials from being cached in browser history or proxy caches.

---

## 3. 🚨 CRITICAL: Sensitive File Exposure

### 3.1 `package.json` — Publicly Accessible (HTTP 200)
**URL:** `https://www.mangotreetechnology.com/package.json`

```json
{
  "name": "mango-tree-website",
  "version": "1.0.0",
  "description": "Mango Tree Technology Website",
  "main": "index.html",
  "scripts": {
    "start": "npx serve",
    "serve": "npx serve"
  },
  "license": "ISC"
}
```

**Risk Assessment:**
- Reveals the site is served via `npx serve` — a **development-grade server**, not production infrastructure
- Confirms the entire project root directory is being web-served
- Any file placed in the root (config, logs, backups, `.env`) would be publicly accessible
- Attackers now know exactly what to probe for

### 3.2 `.htaccess` — Publicly Accessible (HTTP 200)
**URL:** `https://www.mangotreetechnology.com/.htaccess`

```apache
# .htaccess file to remove .html extension and ensure clean URLs
RewriteEngine On
RewriteCond %{THE_REQUEST} ^[A-Z]{3,9}\ /(.+)\.html\ HTTP/
RewriteRule ^(.+)\.html$ /$1 [R=301,L]
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}\.html -f
RewriteRule ^(.+)$ $1.html [L]
ErrorDocument 404 /404.html
```

**Risk:** Discloses server routing logic. The `.htaccess` file itself should never be web-readable. While the contents are benign, it confirms attack surface probing opportunities.

> [!CAUTION]
> Both `package.json` and `.htaccess` are publicly readable. This confirms the web root is being fully exposed by the development server. Files like `.env`, `config.json`, `backup.zip`, etc. would be accessible if they exist in the project root.

---

## 4. 🚨 CRITICAL: Third-Party Uncontrolled Form Submission

**Found in:** `assets/js/components.js`

### Contact / Quote Form Action:
```
https://scriptfusions.mnsithub.com/html/Mango Tree Technology/main-html/assets/inc/sendemail.php
```

### Newsletter Subscription Form:
```
https://scriptfusions.mnsithub.com/html/Mango Tree Technology/main-html/blogs
```

> [!CAUTION]
> **All contact form data (names, emails, phone numbers, business inquiries) is being submitted to a third-party server `mnsithub.com` that Mango Tree Technology does NOT appear to own or control.** Critical risks:
>
> 1. **Data exfiltration**: If `mnsithub.com` is compromised, ALL contact/lead data is captured
> 2. **Currently broken**: The PHP mailer returned **HTTP 404** — all contact inquiries are silently dropped
> 3. **Supply chain risk**: Core business functionality depends on an uncontrolled external server
> 4. **Privacy violation**: User PII is sent to an undisclosed third party — potential GDPR/DPDP Act violation
> 5. **No encryption guarantee**: Data in transit to a third-party server with no SLA/agreement

**Business Impact:** Every client inquiry submitted through the website is currently **being lost** and potentially **intercepted** by a third party.

---

## 5. Authentication & Login Page Analysis

**URL:** `https://www.mangotreetechnology.com/login`

| Check | Finding | Risk |
|-------|---------|------|
| CSRF Token | Not visible in source | ❌ Potential CSRF vulnerability |
| Rate Limiting | No `X-RateLimit-*` headers | ❌ Brute force possible |
| CAPTCHA | Not present | ❌ Credential stuffing risk |
| Cookies set | None on load | ⚠️ Session mechanism unclear |
| `/sign-up` link | Returns 404 | ❌ Broken — referenced from login |
| "Forgot password" | Links back to `/login` | ❌ Broken functionality |
| Login in sitemap | Yes — indexed | ⚠️ Increases discoverability |

> [!WARNING]
> The login page has no visible CSRF protection, no observable rate limiting, and no CAPTCHA. This makes it a target for automated credential stuffing and brute force attacks. The fact that all referenced secondary pages (sign-up, forgot password) are broken raises questions about whether the login system is functional at all.

---

## 6. Robots.txt Analysis

```
User-agent: *
Content-Signal: search=yes, ai-train=no
Allow: /

# Blocks AI bots: Amazonbot, Applebot-Extended, Bytespider, 
# CCBot, ClaudeBot, GPTBot, Google-Extended, meta-externalagent
```

**Findings:**
- No sensitive paths hidden — `Allow: /` exposes everything
- Login page is NOT disallowed — it's indexable by search engines
- Good anti-AI training directives via Cloudflare

---

## 7. Sitemap Findings

The sitemap (`/sitemap.xml`) exposed **837 lines** including:

| Issue | Detail | Risk |
|-------|--------|------|
| `/404` in sitemap | Error page indexed | Low |
| `/login` in sitemap | Auth page crawlable | Medium |
| `/coming-soon` in sitemap | Under-dev pages exposed | Low |
| Static asset URLs in sitemap | Font files included | Info |
| `/team` page | All employee names/roles | Medium |
| 50+ blog URLs | Fully enumerated | Info |

---

## 8. Information Disclosure — OSINT

### 8.1 Team Members (Social Engineering Risk)
From `/team` page — all names and roles are public:
- Sandeep — AI Engineer
- Gaurav Jha — AI Intern
- Himanshu — Frontend Developer
- Ayush — Data Analyst
- Garvit — Graphic Designer
- Vikas — Graphic Designer
- Jitender — (no title shown)
- Shamsher — (no title shown)

For a cybersecurity company, this is a significant social engineering risk. Attackers can use these names for targeted phishing campaigns against the company's own clients.

### 8.2 Physical Address
`3rd Floor, Plot No. 3, Sector-12, Dwarka, New Delhi, 110078 IN`

### 8.3 Phone Number Discrepancy
- Displayed: `+91 9220607577`
- Hardcoded in HTML `tel:` attribute: `9900567780` (different number)

### 8.4 Cloudflare Analytics Token in HTML Source
```
"token": "1b2c6fe4837245f19421a4a3b84ef7db"
```
(Cloudflare Web Analytics beacon token — low risk but confirms analytics platform)

### 8.5 Full Technology Stack Fingerprinted
From JS files, the stack is fully visible:
- jQuery 3.6.0, Bootstrap, GSAP, Swiper, AOS, Owl Carousel, Magnific Popup, jQuery Validate, WOW.js, Isotope, typed.js, odometer, Jarallax (30+ libraries)
- `jquery.ajaxchimp.min.js` indicates **Mailchimp** is used for newsletter

### 8.6 Social Media Profiles
- Facebook: `/mangotree.technology`
- Instagram: `/mangotree.technology`
- LinkedIn: `/company/mangotreetechnology`

---

## 9. Content & Business Logic Issues

| Issue | Detail |
|-------|--------|
| Fake counters | `00+` placeholders never load (broken JS animation) |
| Duplicate FAQ answers | All 4 FAQ questions have identical answers (copy-paste template never filled) |
| Broken newsletter form | Submits to unreachable third-party server |
| Missing sign-up page | `/sign-up` returns 404 but is linked from login |
| Claim vs. Reality | Claims "Enhanced Security and Data Protection" as a core value, but site fails basic security hygiene |

---

## 10. Privacy & Compliance Gaps

| Requirement | Status |
|-------------|--------|
| Cookie consent banner | ❌ Missing |
| Third-party data processor disclosure | ❌ Missing (mnsithub.com not disclosed) |
| DMARC record | ❌ Not found |
| Privacy policy exists | ✅ Present |
| Terms & Conditions exists | ✅ Present |
| GDPR/DPDP compliant forms | ❌ Data sent to uncontrolled third party |

---

## 11. Complete Vulnerability Summary

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🔴 CRITICAL | Data Privacy | Contact form submits to uncontrolled `mnsithub.com` |
| 2 | 🔴 CRITICAL | Config Exposure | `package.json` publicly readable — confirms dev server |
| 3 | 🔴 CRITICAL | Missing Header | No Content-Security-Policy (CSP) |
| 4 | 🟠 HIGH | Config Exposure | `.htaccess` publicly readable |
| 5 | 🟠 HIGH | Missing Header | No `X-Frame-Options` — Clickjacking |
| 6 | 🟠 HIGH | Email Security | SPF `~all` — email spoofing possible |
| 7 | 🟠 HIGH | Auth | Login: no CSRF, no rate limit, no CAPTCHA |
| 8 | 🟠 HIGH | Business Logic | Contact form returns 404 — all inquiries dropped |
| 9 | 🟡 MEDIUM | Info Disclosure | Full tech stack fingerprinted (30+ JS libraries) |
| 10 | 🟡 MEDIUM | Info Disclosure | Team page exposes all employee names/roles |
| 11 | 🟡 MEDIUM | Missing Header | No `Permissions-Policy` |
| 12 | 🟡 MEDIUM | Missing Header | No `COOP`/`COEP` headers |
| 13 | 🟡 MEDIUM | Privacy | No cookie consent |
| 14 | 🟡 MEDIUM | Caching | Login page served as `public` cache |
| 15 | 🟡 MEDIUM | DNS | Unknown orphaned TXT records |
| 16 | 🟢 LOW | Info Disclosure | Phone number discrepancy in source vs display |
| 17 | 🟢 LOW | Broken Links | `/sign-up` → 404, linked from login page |
| 18 | 🟢 LOW | SEO/Security | 404 page indexed in sitemap |
| 19 | 🟢 LOW | Dependencies | jQuery 3.6.0 (2021) — not latest |
| 20 | 🟢 LOW | Infrastructure | Production site running `npx serve` (dev server) |

---

## 12. Remediation Recommendations

### 🔴 IMMEDIATE (This Week)

**1. Fix the contact form**
Move form handling to a self-hosted endpoint. Remove `mnsithub.com` dependency entirely. Every contact form submission is currently being lost AND potentially collected by a third party.

**2. Block sensitive file access**
Add to `.htaccess` (or Cloudflare firewall rule):
```apache
<FilesMatch "^(package\.json|package-lock\.json|\.env|\.htaccess|\.git|tsconfig\.json)">
    Order allow,deny
    Deny from all
</FilesMatch>
```

**3. Add Content-Security-Policy header**
```
Content-Security-Policy: default-src 'self'; 
  script-src 'self' static.cloudflareinsights.com; 
  style-src 'self' 'unsafe-inline' fonts.googleapis.com;
  font-src 'self' fonts.gstatic.com;
  img-src 'self' data: https:;
  frame-ancestors 'none';
```

**4. Add X-Frame-Options**
```
X-Frame-Options: SAMEORIGIN
```

### 🟠 HIGH (This Month)

**5. Fix SPF to HardFail + add DMARC**
```
v=spf1 include:_spf.mail.hostinger.com -all
```
Add DMARC:
```
_dmarc.mangotreetechnology.com TXT "v=DMARC1; p=reject; rua=mailto:dmarc@mangotreetechnology.com"
```

**6. Secure the login page**
- Add CSRF tokens to all forms
- Implement rate limiting (max 5 attempts/minute per IP)
- Add reCAPTCHA v3
- Fix Cache-Control: `no-store, no-cache, must-revalidate`

**7. Fix broken auth flows**
- Create the `/sign-up` page or remove the link
- Fix the "Forgot Password" flow

**8. Add Permissions-Policy**
```
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

**9. Migrate to production-grade server**
Replace `npx serve` with properly configured Nginx/Apache or deploy on a managed hosting platform with proper security headers set at server level.

### 🟡 MEDIUM (This Quarter)

**10.** Audit and remove unknown DNS TXT records

**11.** Implement GDPR/DPDP-compliant cookie consent banner

**12.** Update jQuery to 3.7.x+, audit all outdated dependencies

**13.** Remove `/login` from sitemap.xml, add `Disallow: /login` to robots.txt

**14.** Replace all placeholder content (00+ counters, duplicate FAQ answers)

**15.** Fix phone number discrepancy between HTML source and displayed number

---

## 13. Positive Security Controls ✅

| Control | Status |
|---------|--------|
| HTTPS/TLS enforced site-wide | ✅ |
| HSTS with preload (`max-age=10886400`) | ✅ |
| Cloudflare CDN (DDoS mitigation) | ✅ |
| Real server IP hidden behind Cloudflare | ✅ |
| `X-Content-Type-Options: nosniff` | ✅ |
| `Referrer-Policy: same-origin` | ✅ |
| No `.env` file exposed | ✅ |
| No `.git` directory exposed | ✅ |
| No WordPress/CMS attack surface | ✅ |
| No SQL injection surface (static site) | ✅ |
| Anti-AI-scraping in robots.txt | ✅ |
| Cloudflare email address obfuscation | ✅ |
| No admin panel exposed | ✅ |

---

## Appendix: Saved Evidence Files

| File | Location | Description |
|------|----------|-------------|
| `homepage_source.html` | `mango_tree_tech/` | Full homepage HTML source |
| `script_js.js` | `mango_tree_tech/` | Main site JavaScript |
| `components_js.js` | `mango_tree_tech/` | Components JS (contains form endpoints) |
| `security_audit_report.md` | `mango_tree_tech/` | This report |

---

*This audit was conducted using **passive, non-destructive reconnaissance** techniques only. No active exploitation, fuzzing, credential testing, or injection was attempted. All findings are based on publicly accessible information. A full penetration test would require written authorization and would cover additional vectors including authenticated endpoints, IDOR, server-side injection, and API security.*

**Report Date:** 2026-04-26 | **Auditor:** Antigravity AI
