"""
nmap port scan on all discovered UIDAI IPs
Checks for exposed admin ports, databases, internal services
"""
import subprocess
import sys

IPS = [
    "103.58.114.101",   # uidai.gov.in
    "103.57.226.101",   # uidai.gov.in secondary
    "103.57.226.193",   # myaadhaar.uidai.gov.in
    "103.58.114.187",   # bookappointment.uidai.gov.in
]

INTERESTING_PORTS = [
    21,     # FTP
    22,     # SSH
    23,     # Telnet
    25,     # SMTP
    80,     # HTTP
    443,    # HTTPS
    3306,   # MySQL
    5432,   # PostgreSQL
    6379,   # Redis
    8080,   # Alt HTTP / Tomcat
    8443,   # Alt HTTPS
    8888,   # Jupyter / dev
    9200,   # Elasticsearch
    9300,   # Elasticsearch cluster
    27017,  # MongoDB
    6443,   # Kubernetes API
    10250,  # Kubernetes kubelet
    2379,   # etcd (Kubernetes)
    2380,   # etcd peer
    4040,   # Spark / misc admin
    9090,   # Prometheus
    3000,   # Grafana
    5601,   # Kibana
    8161,   # ActiveMQ admin
    61616,  # ActiveMQ
    11211,  # Memcached
    4848,   # GlassFish admin
    7001,   # WebLogic
    7002,   # WebLogic SSL
    9000,   # SonarQube / PHP-FPM
    4200,   # Angular dev
    3389,   # RDP
    5900,   # VNC
    1099,   # RMI
    8009,   # Tomcat AJP (Ghostcat)
]

port_str = ",".join(str(p) for p in INTERESTING_PORTS)

print("=" * 70)
print("NMAP PORT SCAN — UIDAI Infrastructure IPs")
print("=" * 70)
print(f"Scanning {len(IPS)} IPs for {len(INTERESTING_PORTS)} interesting ports")
print()

for ip in IPS:
    print(f"\n[SCANNING] {ip}")
    print("-" * 50)
    try:
        result = subprocess.run(
            ["nmap", "-sS", "-sV", "--open", "-p", port_str, 
             "--version-intensity", "3", "-T3", "--max-retries", "1",
             "--host-timeout", "60s", ip],
            capture_output=True, text=True, timeout=120
        )
        output = result.stdout
        print(output)
        
        # Save per-IP
        with open(f"nmap_{ip.replace('.','_')}.txt", "w") as f:
            f.write(f"nmap scan of {ip}\n{'='*50}\n")
            f.write(output)
    except FileNotFoundError:
        print("nmap not found in PATH")
        sys.exit(1)
    except subprocess.TimeoutExpired:
        print(f"  Timeout scanning {ip}")
    except Exception as e:
        print(f"  Error: {e}")

print("\n[+] Nmap scans complete")
