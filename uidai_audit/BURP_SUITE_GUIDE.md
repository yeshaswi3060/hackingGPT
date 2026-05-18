# Burp Suite OTP Rate Limit Test — Step-by-Step Guide
## Target: myaadhaar.uidai.gov.in + tathyamndc.uidai.gov.in
## Test: OTP Generation Rate Limiting
## Authorization: Required — use ONLY your own Aadhaar/mobile number

---

## STEP 1 — Download & Install Burp Suite Community (Free)

1. Go to: https://portswigger.net/burp/communitydownload
2. Download the Windows installer (.exe)
3. Run installer → accept defaults → finish
4. Launch Burp Suite → "Temporary project" → "Use Burp defaults" → Start Burp

---

## STEP 2 — Configure Firefox Browser Proxy

> Use Firefox (NOT Chrome) for easier proxy setup

1. Open Firefox
2. Go to: Settings → General → scroll to bottom → Network Settings → Settings
3. Select: "Manual proxy configuration"
4. HTTP Proxy: `127.0.0.1`  Port: `8080`
5. Check "Also use this proxy for HTTPS"
6. Click OK

### Install Burp CA Certificate (required for HTTPS)
1. In Firefox, go to: `http://burpsuite` (with proxy on)
2. Click "CA Certificate" → download `cacert.der`
3. Firefox → Settings → Privacy & Security → View Certificates
4. → Import → select `cacert.der` → check "Trust this CA to identify websites"
5. Click OK

---

## STEP 3 — Capture the OTP Request

1. In Burp Suite → "Proxy" tab → "Intercept" → make sure "Intercept is ON"
2. In Firefox → go to: `https://myaadhaar.uidai.gov.in/`
3. Click any service — e.g., "Verify Aadhaar" or "Download Aadhaar"
4. When the OTP page loads — enter **YOUR OWN** mobile number
5. Click "Send OTP" / "Generate OTP"

6. Burp will INTERCEPT the request — you'll see it in Burp's Proxy tab
   The request will look like:
   ```
   POST /genricDownloadAadhaar/verifyMobile/otp  HTTP/2
   Host: myaadhaar.uidai.gov.in
   Content-Type: application/json
   
   {"mobileNumber":"XXXXXXXXXX","uid":"XXXXXXXXXXXX"}
   ```
   OR it will hit `tathyamndc.uidai.gov.in`:
   ```
   POST /v2/generate/generic/otp  HTTP/2
   Host: tathyamndc.uidai.gov.in
   Authorization: Bearer eyJ...
   
   {"uid":"XXXX","type":"A"}
   ```

7. Right-click the request → "Send to Repeater"
8. Click "Forward" to let the request go through (so you get your real OTP)

---

## STEP 4 — Test Rate Limiting in Burp Repeater

1. Go to Burp → "Repeater" tab
2. You'll see the OTP request you captured
3. Click the blue "Send" button once → check the response
   - Should see: `{"status":"Success"}` or similar
4. Click "Send" again immediately
5. Click "Send" again
6. Keep clicking Send — do it 10 times fast

### What you're looking for:

**No Rate Limiting (CRITICAL FINDING):**
```json
{"status":"Success","message":"OTP sent"}   ← attempt 1
{"status":"Success","message":"OTP sent"}   ← attempt 2
{"status":"Success","message":"OTP sent"}   ← attempt 3
{"status":"Success","message":"OTP sent"}   ← attempt 10
```
→ If you keep getting "Success" with no block, OTP can be generated unlimited times
→ This means an attacker can flood any Aadhaar number with OTP requests (OTP flooding/DoS)
→ Also means if they can intercept OTPs, brute-force is possible

**Good Rate Limiting (no bounty):**
```json
{"status":"Error","message":"Too many requests. Please try after 30 minutes"}  ← gets blocked
```
→ Rate limit exists → not a vulnerability

---

## STEP 5 — Use Burp Intruder for Automated Test (if Repeater shows no limit)

1. Go back to the captured OTP request
2. Right-click → "Send to Intruder"
3. Intruder tab → "Positions" → clear all § markers (click "Clear §")
4. "Payloads" tab → Payload type: "Null payloads"
5. "Continue indefinitely": NO → set to 50 payloads
6. Click "Start attack"
7. Watch the responses — look for when (if ever) you get rate-limited

**Document:** Screenshot the Intruder results table showing all 50 responses

---

## STEP 6 — Also Test These While You Have Burp Running

While intercepting traffic, also check:

### A. Price Manipulation Test (Appointment Payment)
1. Start an appointment booking on `bookappointment.uidai.gov.in`
2. Get to the payment step
3. Intercept the payment creation request in Burp
4. Look for a parameter like `"amount": 50` or `"amount": 100`
5. Change it to `"amount": 1`
6. Forward the request — does payment accept ₹1 instead of the real amount?

### B. Appointment IDOR Test
1. Complete at least one appointment booking
2. Intercept GET requests to `/appointment/details?id=XXXX`
3. Change the appointment ID to ID±1 (e.g., if yours is 12345, try 12344)
4. Forward — do you see someone else's appointment details?

### C. OTP Parameter Tampering
1. Capture the OTP verify request (when you enter your OTP)
2. In Repeater, change the OTP value to a wrong one
3. Send it 20 times — does it ever lock you out?
4. If no lockout → OTP brute-force possible (6-digit OTP = 1,000,000 combinations)

---

## STEP 7 — Documenting Evidence (Critical for Bounty)

For each finding, capture:

1. **Screenshot of Burp request** — showing the exact request sent
2. **Screenshot of Burp response** — showing the server's response  
3. **If rate limit missing:** Screenshot of Intruder results showing 50 successful responses
4. **If price manipulation works:** Screenshot of the payment confirmation at wrong amount
5. **If IDOR works:** Screenshot of another user's data (blur/redact actual PII)

Save screenshots to: `c:\Users\yesha\Desktop\testingGPT\uidai_audit\burp_evidence\`

---

## IMPORTANT — Rules While Testing

- ✅ Use ONLY your own mobile number and Aadhaar for OTP tests
- ✅ Keep all tests non-destructive (no deleting data, no creating fake bookings)
- ✅ Stop immediately if you accidentally access real user data
- ✅ Screenshot everything — timestamps matter for bounty reports
- ❌ Do NOT brute-force or try actual OTP codes (just test the generation rate)
- ❌ Do NOT test with anyone else's credentials
- ❌ Do NOT make actual payments during price manipulation test

---

## Expected Outcome

| Test | If Vulnerable | Bounty Severity |
|------|--------------|----------------|
| OTP rate limit missing | OTP flooding on any UID | 🔴 Critical P1 |
| OTP brute-force (no lockout on verify) | 6-digit OTP crackable | 🔴 Critical P1 |
| Price manipulation | Pay ₹1 for ₹100 service | 🔴 Critical P1 |
| IDOR on appointment ID | See other users' data | 🔴 Critical P1 |
| Any ONE of these confirmed | Report to NCIIPC immediately | Bounty guaranteed |
