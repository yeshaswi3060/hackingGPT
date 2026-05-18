# API & Backend Cracking Playbook

When an API or Authentication endpoint is discovered, execute these attack chains:

## 1. JWT Analysis (Token Cracking)
- **Decode**: Check headers for `alg: none`.
- **Brute Force**: Attempt to crack the HS256 secret using a wordlist.
- **None-alg Bypass**: If `alg: none` is found, remove the signature and attempt to access `admin: true` in the payload.
- **Key-Injection**: Attempt `RS256` to `HS256` key confusion attacks.

## 2. OAuth & Session Hijacking
- **Redirect URI**: Check for open redirects in `redirect_uri` parameters.
- **Scope Expansion**: Attempt to add `scope=*,admin,write` to the auth request.
- **Cross-Site Request Forgery (CSRF)**: Check for missing `state` or `nonce` parameters.

## 3. IDOR & Resource Exposure
- **Param Fuzzing**: For `/api/users/123`, attempt `/api/users/1`, `/api/users/admin`.
- **Method Tampering**: Try `PUT`, `DELETE`, `PATCH` on GET-only endpoints.
- **GraphQL**: If `/graphql` exists, perform an Introspection query to map the entire schema and hidden fields.

## 4. Backend Pivot (Loot Gathering)
- Search for `api_key`, `secret`, `access_token` in all responses.
- Store found keys in **Persistent Key Locker** for use in subsequent tool calls.
