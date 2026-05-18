import requests
import warnings
warnings.filterwarnings('ignore')

domains = ['https://backofficestage.uidai.gov.in', 'https://tathyamndc.uidai.gov.in']
print('INTERNAL DOMAIN PROBE:')
for d in domains:
    try:
        r = requests.get(d, timeout=10, allow_redirects=False, headers={'User-Agent': 'Mozilla/5.0'})
        print(f'  {d}')
        print(f'    Status: {r.status_code}')
        print(f'    Size: {len(r.content)} bytes')
        for k,v in r.headers.items():
            print(f'    {k}: {v}')
    except Exception as e:
        print(f'  {d} -> Error: {e}')
