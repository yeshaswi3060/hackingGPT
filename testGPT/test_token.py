import requests
import json

url = 'https://malyam.com/api/2023-04/graphql.json'
headers = {
    'X-Shopify-Storefront-Access-Token': '251d98dd8598972ea5d29f621e025b28',
    'Content-Type': 'application/json'
}
query = """
{
  shop {
    name
    description
  }
}
"""
payload = {'query': query}

try:
    resp = requests.post(url, headers=headers, json=payload, timeout=10)
    print(f'Status: {resp.status_code}')
    print(f'Response: {resp.text}')
except Exception as e:
    print(f'Error: {e}')

# Also try the admin API with the same token
url_admin = 'https://407h31-a1.myshopify.com/admin/api/2023-04/shop.json'
headers_admin = {
    'X-Shopify-Access-Token': '251d98dd8598972ea5d29f621e025b28'
}
try:
    resp = requests.get(url_admin, headers=headers_admin, timeout=10)
    print(f'Admin Status: {resp.status_code}')
    print(f'Admin Response: {resp.text}')
except Exception as e:
    print(f'Admin Error: {e}')

# Try without token on the storefront API (public)
url_public = 'https://malyam.com/products.json'
try:
    resp = requests.get(url_public, timeout=10)
    print(f'Public products Status: {resp.status_code}')
    if resp.status_code == 200:
        data = resp.json()
        print(f'Number of products: {len(data.get("products", []))}')
except Exception as e:
    print(f'Public products Error: {e}')
