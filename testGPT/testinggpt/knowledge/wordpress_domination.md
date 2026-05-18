# WordPress Domination Playbook

When WordPress is detected, execute these attack chains in order:

## 1. Initial Recon (Stealth)
- Check `robots.txt` for `/wp-admin/`, `/wp-includes/`.
- Access `/wp-json/wp/v2/users` to enumerate real usernames.
- Check `readme.html` or `license.txt` for version disclosures.

## 2. Aggressive Hijacking (XML-RPC)
- If `xmlrpc.php` exists, use `system.listMethods` to check for `wp.getUsersBlogs` or `pingback.ping`.
- **Brute Force**: Attempt `wp.getUsersBlogs` with the enumerated usernames and top 1000 passwords.
- **Pingback SSRF**: Use `pingback.ping` to perform an internal port scan of the server.

## 3. Configuration & Source Leaks
- Attempt to download `wp-config.php.bak`, `wp-config.php~`, `wp-config.old`.
- Check `/wp-content/debug.log` for database credentials or session tokens.
- Search for plugin directories in `/wp-content/plugins/` and check for recent CVEs.

## 4. Privilege Escalation
- If admin access is gained, immediately look for "Theme Editor" or "Plugin Editor" to upload a PHP webshell.
- Look for hardcoded DB credentials in `wp-config.php` to pivot to the database server.
