# UIDAI Security Audit - Round 7 (Infrastructure & OSINT Deep Dive)

**Date:** April 27, 2026
**Target Scope:** `*.uidai.gov.in` (Global Subdomain Namespace)
**Objective:** Bypass main WAF protections by mapping obscure, legacy, or staging infrastructure via OSINT and active DNS probing.

---

## Executive Summary of Sweep
We shifted tactics from analyzing the primary protected web applications (`uidai.gov.in`, `myaadhaar.uidai.gov.in`) to a wide-scale infrastructure reconnaissance strategy. Using custom Python tooling, we aggregated data from Certificate Transparency logs, AlienVault OTX, HackerTarget, and RapidDNS. 

This sweep discovered **40 unique subdomains**. We then ran an active host resolution script which confirmed **16 live web servers**. 

The most critical finding from this sweep is the public exposure of a User Acceptance Testing (UAT)/Staging environment.

---

## Finding 1: Public Exposure of Staging Environment (High Severity)

### Vulnerability Description
Staging and UAT environments are designed for developers to test code before pushing to production. They frequently lack the robust WAF configurations, authentication mechanisms, and monitoring present in production. Furthermore, they often connect to sensitive databases or expose debugging tools.

During our massive subdomain sweep, we discovered a live, public-facing staging environment for the myAadhaar portal.

### Proof of Concept & Evidence
*   **Vulnerable URL:** `https://myaadhaarstage.uidai.gov.in`
*   **Status:** Live (Returns HTTP 200, serves the React SPA)

**Deep Bundle Analysis (Secret Hunter):**
We downloaded the main React JS bundle (`main.52c938e2.js`) from this staging server and ran a custom regex secret hunter. This revealed the internal API architecture used by the staging environment, which differs from production:

1.  **GraphQL Endpoint Discovery:** `myaadhaarstage.uidai.gov.in/pincode/graphql`
    *   *Note: While a GraphQL Introspection probe confirmed the endpoint is active, it correctly requires an Authorization token (`OGS-SEC-001`), proving the auth layer is intact.*
2.  **Profile Service API:** `myaadhaarstage.uidai.gov.in/profileService/api`
3.  **SSUP Service API:** `myaadhaarstage.uidai.gov.in/ssupService/api`
4.  **Telemetry API:** `myaadhaarstage.uidai.gov.in/telemetryservice`

### Impact
While the staging APIs currently enforce authentication, the mere presence of a public staging environment is a severe architectural flaw. It provides attackers with a sandbox to map internal API schemas (like GraphQL) and test payloads without triggering production WAF alarms. If a vulnerability is found in the staging code, it can often be directly ported to attack production.

### Remediation
1.  Restrict access to `myaadhaarstage.uidai.gov.in` to internal UIDAI corporate IP networks or require a VPN connection.
2.  Implement Basic Authentication (htpasswd) at the server level as an immediate stop-gap measure.

---

## Finding 2: Subdomain Takeover Analysis (Informational/Secure)

### Vulnerability Description
Subdomain takeover occurs when a DNS record points to a third-party service (like GitHub Pages, AWS S3, or Zendesk) that has been deleted or unregistered. An attacker can register that service and take control of the government subdomain.

### Proof of Concept & Evidence
We analyzed the CNAME records of the 16 live hosts against a dictionary of known vulnerable takeover signatures.
*   `chat.uidai.gov.in` -> CNAME: `zs-in1-lczhost.zohohost.in` (Zoho)
*   `docs.uidai.gov.in` -> CNAME: `6bac0d8dd1-hosting.gitbook.io` (GitBook)

**Result:** No dangling records were found. The UIDAI infrastructure team has properly claimed and configured their third-party integrations. This proves a good security posture regarding DNS lifecycle management.

---

## Tooling Used
*   `subdomain_enum.py`: Multi-source OSINT aggregation (AlienVault, HackerTarget, RapidDNS).
*   `takeover_scanner.py`: Concurrent HTTP/HTTPS resolution and CNAME signature checking.
*   `staging_secret_hunter.py`: Regex-based static analysis of staging React bundles.
*   `graphql_probe.py`: Automated GraphQL Introspection query payload.
