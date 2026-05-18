# Cloud & Infrastructure Domination Playbook

When Cloud Infrastructure (AWS, Azure, GCP) is detected, execute these attack chains:

## 1. Metadata SSRF
- **AWS**: Attempt to access `http://169.254.169.254/latest/meta-data/iam/security-credentials/`.
- **Azure**: Attempt to access `http://169.254.169.254/metadata/instance?api-version=2021-02-01`.
- **GCP**: Attempt to access `http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token`.

## 2. Credential Gathering
- Search for `.aws/credentials`, `.kube/config`, `config.yaml` in all directories.
- Extract `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` from `.env` files.
- Look for **Temporary Credentials** in `stdout` of failed shell commands.

## 3. Storage Exposure (S3/Buckets)
- Brute force bucket names based on the domain (e.g., `s3://maly-backup/`, `s3://maly-production/`).
- If access is gained, recursively list all files and download any `.sql`, `.zip`, `.key` files.

## 4. Privilege Pivot
- Once an IAM role is assumed, perform a `list_roles` or `get_caller_identity`.
- Attempt to escalate to "Admin" by finding overly permissive IAM policies (e.g., `iam:PutRolePolicy`).
