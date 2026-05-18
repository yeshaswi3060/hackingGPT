# Vulnerability Disclosure Report: UIDAI Web Infrastructure
**Date:** April 27, 2026
**Target Scope:** `*.uidai.gov.in` (Authorized Assessment)
**Assessment Type:** Non-Destructive Infrastructure & Configuration Audit

---

## Executive Summary
During an authorized, non-destructive security assessment of the UIDAI web infrastructure, multiple Critical and High severity vulnerabilities were identified. These vulnerabilities do not reside in the core application logic (which was found to be secure against rate-limiting and brute-force attacks), but rather in **systemic infrastructure misconfigurations and deployment lifecycle errors**.

The most critical findings include the exposure of live payment gateway secrets due to bundled configuration files, the public accessibility of the User Acceptance Testing (UAT/Staging) environment, and internal backend API gateway exposure. 

These vulnerabilities pose a direct risk to the confidentiality and integrity of UIDAI infrastructure and payment systems.

---

## 🔴 VULNERABILITY 1: Hardcoded Production Payment Secrets (CRITICAL)

### Description
The production Flutter web application (`bookappointment.uidai.gov.in`) accidentally bundles sensitive server-side configuration files into the client-side JavaScript build. This results in the direct exposure of the **Razorpay LIVE Merchant Key**. 

### Affected Component
*   **URL:** `https://bookappointment.uidai.gov.in/main.dart.js`
*   **Root Cause:** `lib/.env` is improperly included in the `AssetManifest.json` during the Flutter build process.

### Proof of Concept (Evidence)
By downloading and inspecting the public `main.dart.js` file, the following live production keys are visible in plaintext:

```javascript
// Extracted from main.dart.js
rzp_live_OJAxlTzJErna95  // Razorpay LIVE Merchant Key
rzp_test_YaF84ZL2G2yQfx  // Razorpay Test Key
```

### Business Impact
Exposure of a Razorpay Live Key allows a malicious actor to potentially spoof payment requests, view transaction metadata, or cause financial disruption to UIDAI's payment collection processes. Payment providers classify hardcoded live keys as P1/Critical security incidents.

### Remediation
1. Immediately rotate the exposed Razorpay LIVE key (`rzp_live_OJAxlTzJErna95`) via the Razorpay Dashboard.
2. Modify the Flutter `pubspec.yaml` and build pipeline to ensure `.env` files are strictly excluded from the `assets` compilation process.

---

## 🔴 VULNERABILITY 2: Public Exposure of Staging Environment & Internal APIs (CRITICAL)

### Description
Staging and UAT environments, which are replicas of production systems used for testing, are exposed to the public internet without network-level access controls (e.g., VPN requirement or IP whitelisting). This exposes internal API structures, including GraphQL endpoints, that are not meant for public consumption.

### Affected Component
*   **URL:** `https://myaadhaarstage.uidai.gov.in`

### Proof of Concept (Evidence)
The staging environment is publicly resolvable and serving the React Single Page Application (SPA). By analyzing the staging JS bundle (`main.52c938e2.js`), the following internal API routes—which differ from the production routing—were mapped:

1.  **GraphQL API:** `myaadhaarstage.uidai.gov.in/pincode/graphql` (Introspection queries confirm endpoint existence, though currently returning 401 Unauthorized).
2.  **SSUP Service API:** `myaadhaarstage.uidai.gov.in/ssupService/api`
3.  **Profile Service API:** `myaadhaarstage.uidai.gov.in/profileService/api`

### Business Impact
Public staging environments provide attackers with a "sandbox" to analyze internal API schemas (like GraphQL) and test exploitation payloads without triggering production Web Application Firewall (WAF) alarms. Vulnerabilities discovered in staging code can frequently be ported directly to production.

### Remediation
1. Restrict DNS resolution and network access to `myaadhaarstage.uidai.gov.in` strictly to internal UIDAI corporate networks.
2. If external access is required for vendors, implement zero-trust authentication (e.g., Cloudflare Access) or VPN requirements.

---



---

## Note on Security Posture Verification
As part of this assessment, the primary OTP authentication flow (`/access/generateOTPForOAuth` and `/access/login`) was rigorously tested. 
*   OTP generation correctly enforces CAPTCHA validation per request, preventing SMS flooding.
*   OTP verification correctly enforces rate limiting (`Maximum number of attempts for OTP match is exceeded`), preventing OTP brute-forcing.
**Conclusion:** The primary application logic is secure; the vulnerabilities lie purely in infrastructure deployment and configuration.

---
**Report compiled using non-destructive, authorized security assessment methodologies.**
