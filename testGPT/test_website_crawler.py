"""
Website Source Code Crawler — Test Script
==========================================
Provide a URL and this script will:
1. Fetch the main page HTML
2. Discover and download all linked JS, CSS, and internal pages
3. Save everything into a local folder preserving the site structure

Usage:
    python test_website_crawler.py https://example.com
"""

import os
import sys
import re
import tempfile
import time
from urllib.parse import urljoin, urlparse, unquote
from collections import deque
from pathlib import Path

import requests
import urllib3
from bs4 import BeautifulSoup

# Suppress SSL warnings (needed for security testing tools)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# ── Config ──────────────────────────────────────────────────────────────────
MAX_DEPTH = 2          # How many link-levels deep to crawl
MAX_PAGES = 50         # Max pages to fetch
MAX_ASSETS = 200       # Max JS/CSS/asset files to download
REQUEST_TIMEOUT = 15   # Seconds per request
DELAY_BETWEEN = 0.3    # Polite delay between requests (seconds)

# File extensions we want to save
CODE_EXTENSIONS = {
    '.html', '.htm', '.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.less',
    '.json', '.xml', '.svg', '.php', '.asp', '.aspx', '.jsp', '.py', '.rb',
    '.map', '.mjs', '.cjs',
}

# ── Helpers ─────────────────────────────────────────────────────────────────

def is_same_domain(base_url: str, check_url: str) -> bool:
    """Check if a URL belongs to the same domain as the base."""
    base_domain = urlparse(base_url).netloc.lower()
    check_domain = urlparse(check_url).netloc.lower()
    # Also allow subdomain matches (e.g. www.example.com == example.com)
    return check_domain == base_domain or check_domain.endswith('.' + base_domain) or base_domain.endswith('.' + check_domain)


def url_to_filepath(url: str, base_domain: str) -> str:
    """Convert a URL to a local file path."""
    parsed = urlparse(url)
    path = unquote(parsed.path).strip('/')
    
    if not path:
        path = 'index.html'
    elif not Path(path).suffix:
        path = path.rstrip('/') + '/index.html'
    
    # Remove query string characters that break filenames
    path = re.sub(r'[?#<>:"|*]', '_', path)
    return path


def safe_get(url: str, session: requests.Session) -> requests.Response | None:
    """Fetch a URL safely with error handling."""
    try:
        resp = session.get(url, timeout=REQUEST_TIMEOUT, allow_redirects=True, verify=False)
        resp.raise_for_status()
        return resp
    except Exception as e:
        print(f"  ⚠ Failed: {url} — {e}")
        return None


def extract_links(html: str, page_url: str) -> dict:
    """Extract all resource links from HTML."""
    soup = BeautifulSoup(html, 'html.parser')
    
    links = {
        'pages': set(),     # Internal page links to crawl
        'scripts': set(),   # JS files
        'styles': set(),    # CSS files
        'assets': set(),    # Other assets (images, fonts, etc.)
    }
    
    base_domain = urlparse(page_url).netloc
    
    # — Internal page links (<a href>) —
    for tag in soup.find_all('a', href=True):
        href = urljoin(page_url, tag['href'])
        href = href.split('#')[0].split('?')[0]  # Remove fragment/query
        if href and is_same_domain(page_url, href):
            links['pages'].add(href)
    
    # — Script files (<script src>) —
    for tag in soup.find_all('script', src=True):
        src = urljoin(page_url, tag['src'])
        links['scripts'].add(src)
    
    # — Stylesheet files (<link rel="stylesheet">) —
    for tag in soup.find_all('link', href=True):
        rel = tag.get('rel', [])
        href = urljoin(page_url, tag['href'])
        if 'stylesheet' in rel or href.endswith('.css'):
            links['styles'].add(href)
    
    # — Inline scripts and styles (save as separate files) —
    # These are captured in the HTML itself, no separate download needed
    
    # — Other assets (images, etc. — optional) —
    for tag in soup.find_all('img', src=True):
        src = urljoin(page_url, tag['src'])
        if is_same_domain(page_url, src):
            links['assets'].add(src)
    
    return links


# ── Main Crawler ────────────────────────────────────────────────────────────

def crawl_website(start_url: str, output_dir: str = None) -> str:
    """
    Crawl a website starting from `start_url`, downloading all HTML, JS, CSS.
    Returns the path to the output folder.
    """
    parsed = urlparse(start_url)
    domain = parsed.netloc or 'unknown'
    
    # Create output directory
    if not output_dir:
        output_dir = os.path.join(tempfile.gettempdir(), f"audit_{domain}_{int(time.time())}")
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"\n{'='*60}")
    print(f"  🌐 WEBSITE CRAWLER")
    print(f"  Target: {start_url}")
    print(f"  Output: {output_dir}")
    print(f"  Max Depth: {MAX_DEPTH} | Max Pages: {MAX_PAGES}")
    print(f"{'='*60}\n")
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
    })
    
    # BFS queue: (url, depth)
    queue = deque([(start_url, 0)])
    visited_pages = set()
    downloaded_assets = set()
    
    stats = {'pages': 0, 'scripts': 0, 'styles': 0, 'other': 0, 'errors': 0, 'bytes': 0}
    
    while queue and stats['pages'] < MAX_PAGES:
        current_url, depth = queue.popleft()
        
        # Normalize URL
        current_url = current_url.split('#')[0]
        if current_url in visited_pages:
            continue
        visited_pages.add(current_url)
        
        # Fetch page
        print(f"  📄 [{depth}] Fetching page: {current_url}")
        resp = safe_get(current_url, session)
        if not resp:
            stats['errors'] += 1
            continue
        
        content_type = resp.headers.get('content-type', '')
        
        # Save the page
        file_path = url_to_filepath(current_url, domain)
        full_path = os.path.join(output_dir, file_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        
        # Write content
        if 'text' in content_type or 'javascript' in content_type or 'json' in content_type:
            with open(full_path, 'w', encoding='utf-8', errors='ignore') as f:
                f.write(resp.text)
        else:
            with open(full_path, 'wb') as f:
                f.write(resp.content)
        
        file_size = len(resp.content)
        stats['pages'] += 1
        stats['bytes'] += file_size
        print(f"       ✅ Saved: {file_path} ({file_size:,} bytes)")
        
        # Parse links only for HTML pages
        if 'html' not in content_type:
            continue
            
        links = extract_links(resp.text, current_url)
        
        # Queue internal pages for crawling (if within depth limit)
        if depth < MAX_DEPTH:
            for page_url in links['pages']:
                if page_url not in visited_pages:
                    queue.append((page_url, depth + 1))
        
        # Download JS files
        for script_url in links['scripts']:
            if script_url in downloaded_assets or len(downloaded_assets) >= MAX_ASSETS:
                continue
            downloaded_assets.add(script_url)
            
            print(f"  📜 Downloading JS: {script_url}")
            r = safe_get(script_url, session)
            if r:
                fp = url_to_filepath(script_url, domain)
                if not fp.endswith('.js') and not fp.endswith('.mjs'):
                    fp += '.js'
                full = os.path.join(output_dir, fp)
                os.makedirs(os.path.dirname(full), exist_ok=True)
                with open(full, 'w', encoding='utf-8', errors='ignore') as f:
                    f.write(r.text)
                stats['scripts'] += 1
                stats['bytes'] += len(r.content)
                print(f"       ✅ Saved: {fp} ({len(r.content):,} bytes)")
            else:
                stats['errors'] += 1
            time.sleep(DELAY_BETWEEN)
        
        # Download CSS files
        for style_url in links['styles']:
            if style_url in downloaded_assets or len(downloaded_assets) >= MAX_ASSETS:
                continue
            downloaded_assets.add(style_url)
            
            print(f"  🎨 Downloading CSS: {style_url}")
            r = safe_get(style_url, session)
            if r:
                fp = url_to_filepath(style_url, domain)
                if not fp.endswith('.css'):
                    fp += '.css'
                full = os.path.join(output_dir, fp)
                os.makedirs(os.path.dirname(full), exist_ok=True)
                with open(full, 'w', encoding='utf-8', errors='ignore') as f:
                    f.write(r.text)
                stats['styles'] += 1
                stats['bytes'] += len(r.content)
                print(f"       ✅ Saved: {fp} ({len(r.content):,} bytes)")
            else:
                stats['errors'] += 1
            time.sleep(DELAY_BETWEEN)
        
        time.sleep(DELAY_BETWEEN)
    
    # ── Summary ──
    total_files = stats['pages'] + stats['scripts'] + stats['styles'] + stats['other']
    mb = stats['bytes'] / (1024 * 1024)
    
    print(f"\n{'='*60}")
    print(f"  ✅ CRAWL COMPLETE")
    print(f"  📁 Output folder: {output_dir}")
    print(f"  📄 HTML pages:    {stats['pages']}")
    print(f"  📜 JS files:      {stats['scripts']}")
    print(f"  🎨 CSS files:     {stats['styles']}")
    print(f"  ⚠ Errors:        {stats['errors']}")
    print(f"  💾 Total size:    {mb:.2f} MB ({stats['bytes']:,} bytes)")
    print(f"  📦 Total files:   {total_files}")
    print(f"{'='*60}\n")
    
    # List all downloaded files
    print("  📋 Downloaded files:")
    for root, dirs, files in os.walk(output_dir):
        for fname in sorted(files):
            rel = os.path.relpath(os.path.join(root, fname), output_dir)
            size = os.path.getsize(os.path.join(root, fname))
            print(f"     {rel} ({size:,} bytes)")
    
    return output_dir


# ── CLI Entry Point ─────────────────────────────────────────────────────────

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python test_website_crawler.py <URL> [output_folder]")
        print("Example: python test_website_crawler.py https://example.com")
        sys.exit(1)
    
    url = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else None
    
    if not url.startswith('http'):
        url = 'https://' + url
    
    result_folder = crawl_website(url, out)
    print(f"\n🎯 All source code saved to: {result_folder}")
    print("   You can now point the Code Audit feature at this folder!")
