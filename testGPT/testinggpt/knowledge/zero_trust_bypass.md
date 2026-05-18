# Zero-Trust & MFA Bypass Playbook

When a target uses SSO, 2FA, or MFA (e.g., Okta, Duo, MS Entra ID), execute these attack chains:

## 1. SSO Logical Bypasses
- **Protocol Downgrade**: If the site supports both SAML and LDAP, attempt to bypass the SSO by using the LDAP endpoint directly.
- **Header Manipulation**: Try injecting `X-Forwarded-For: 127.0.0.1` or `X-Remote-IP` to see if the SSO treats the request as coming from an internal, trusted network.
- **Subdomain Takeover**: If a subdomain like `sso.domain.com` is pointing to an unclaimed resource, take it over to intercept credentials.

## 2. MFA/2FA Bypasses
- **Response Manipulation**: Capture a failed MFA response and change the status code from `401 Unauthorized` to `200 OK` or `302 Found` to see if the client-side logic lets you in.
- **Session Reuse**: If you find an authenticated session cookie from an unprotected subdomain, try using it on the 2FA-protected site.
- **Rate-Limit Exhaustion**: If the 2FA code is 4 digits and there is no rate-limiting, use a custom script in `python_generator` to brute-force the code.

## 3. Persistent Token Theft
- **Local Storage/Cookies**: Search for `authToken`, `sessionID`, or `OIDC_token` in the browser's local storage and cookies.
- **Bearer Token Hijacking**: Intercept tokens from the browser's Network tab or `Authorization` headers.

## 4. Conditional Access Bypass
- **User Agent Spoofing**: Change your User-Agent to a "Trusted Device" (e.g., an internal company-managed Mac).
- **IP Spoofing**: Use found internal IP addresses in `X-Originating-IP` headers to bypass IP-based geofences.
