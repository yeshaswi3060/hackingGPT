"""
GraphQL Introspection Probe
Checks if the GraphQL endpoint exposes its entire schema structure.
"""
import requests
import json
import warnings

warnings.filterwarnings('ignore')

URL = "https://myaadhaarstage.uidai.gov.in/pincode/graphql"

# Standard Introspection Query
query = """
    query IntrospectionQuery {
      __schema {
        queryType { name }
        mutationType { name }
        subscriptionType { name }
        types {
          ...FullType
        }
        directives {
          name
          description
          locations
          args {
            ...InputValue
          }
        }
      }
    }
    fragment FullType on __Type {
      kind
      name
      description
      fields(includeDeprecated: true) {
        name
        description
        args {
          ...InputValue
        }
        type {
          ...TypeRef
        }
        isDeprecated
        deprecationReason
      }
      inputFields {
        ...InputValue
      }
      interfaces {
        ...TypeRef
      }
      enumValues(includeDeprecated: true) {
        name
        description
        isDeprecated
        deprecationReason
      }
      possibleTypes {
        ...TypeRef
      }
    }
    fragment InputValue on __InputValue {
      name
      description
      type { ...TypeRef }
      defaultValue
    }
    fragment TypeRef on __Type {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                  ofType {
                    kind
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
"""

print(f"[*] Probing {URL} for GraphQL Introspection...")
try:
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    payload = {"query": query}
    
    r = requests.post(URL, json=payload, headers=headers, timeout=10, verify=False)
    
    if r.status_code == 200:
        data = r.json()
        if 'data' in data and '__schema' in data['data']:
            print("[!!!] INTROSPECTION IS ENABLED!")
            print("[+] Successfully extracted the entire database schema.")
            # Save it to a file
            with open("graphql_schema_dump.json", "w") as f:
                json.dump(data, f, indent=2)
            print("[+] Schema saved to graphql_schema_dump.json")
            
            # Print a quick summary of the types
            types = data['data']['__schema']['types']
            custom_types = [t['name'] for t in types if not t['name'].startswith('__')]
            print(f"\n[*] Found {len(custom_types)} custom types/objects in the schema:")
            for ct in custom_types[:10]:
                print(f"  - {ct}")
            if len(custom_types) > 10:
                print(f"  ... and {len(custom_types) - 10} more.")
                
        else:
             print(f"[-] Query succeeded but introspection __schema not found. Response: {str(data)[:200]}")
    else:
        print(f"[-] Server returned {r.status_code}. Introspection likely disabled or endpoint is protected.")
        print(f"    Preview: {r.text[:200]}")

except Exception as e:
    print(f"[!] Error: {e}")
