"""
Extract Payment API logic from main.dart.js to find Price Manipulation vectors.
"""
import requests
import re
import warnings
warnings.filterwarnings('ignore')

URL = "https://bookappointment.uidai.gov.in/main.dart.js"

print("Fetching main.dart.js for payment logic analysis...")
try:
    r = requests.get(URL, timeout=15)
    content = r.text
    
    print("\n[+] Hunting for Payment construction logic (Razorpay)...")
    
    # Look for object keys related to payment payload
    payment_keys = ['amount', 'currency', 'receipt', 'order_id', 'payment_id', 'signature', 'rzp']
    
    # Try to find JSON-like structures or Dart maps containing 'amount' and Razorpay keys
    # This regex looks for blocks of code containing 'amount' near 'rzp_live' or 'razorpay'
    blocks = re.split(r'function\s*\(', content)
    
    found_logic = False
    for i, block in enumerate(blocks):
        if 'amount' in block.lower() and ('razorpay' in block.lower() or 'rzp' in block.lower()):
            if len(block) < 2000: # Keep it readable
                print(f"\n--- Potential Payment Logic Block {i} ---")
                # Clean up the JS slightly for reading
                clean_block = block.replace('\n', ' ').strip()
                print(clean_block[:1000] + "...")
                found_logic = True
                
    if not found_logic:
        print("[-] Could not isolate clear client-side payment payload construction.")
        print("    The amount might be calculated strictly server-side.")

except Exception as e:
    print(f"Error: {e}")
