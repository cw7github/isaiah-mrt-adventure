#!/usr/bin/env python3
"""
Scrape posts from a Substack publication and save as Markdown.

Usage:
  python3 scripts/scrape_substack.py --base https://austinscholar.substack.com --out austin_scholar_substack

Notes:
- Uses public Substack endpoints:
  - List posts:   {base}/api/v1/posts?sort=new&limit=50&offset=N
  - Post details: {base}/api/v1/posts/{slug}
- Paid posts will include preview HTML only; we save whatever is available.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import sys
import time
from pathlib import Path
from typing import Iterable

try:
    import requests
except ImportError as e:
    print("Missing dependency: requests. Install with: pip install requests", file=sys.stderr)
    raise

try:
    from markdownify import markdownify as html_to_md
except ImportError:
    html_to_md = None


def slugify_filename(text: str) -> str:
    text = text.strip().lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"-+", "-", text).strip("-")
    return text or "post"


def iso_to_date(iso: str) -> str:
    try:
        # Normalize to date (YYYY-MM-DD) in UTC
        dt_obj = dt.datetime.fromisoformat(iso.replace("Z", "+00:00")).astimezone(dt.timezone.utc)
        return dt_obj.strftime("%Y-%m-%d")
    except Exception:
        return iso.split("T")[0][:10] if iso else "unknown-date"


def fetch_json(session: requests.Session, url: str) -> dict | list:
    r = session.get(url, timeout=30)
    r.raise_for_status()
    return r.json()


def list_all_posts(base_url: str, session: requests.Session) -> list[dict]:
    posts: list[dict] = []
    offset = 0
    limit = 50  # API appears capped at 50
    while True:
        url = f"{base_url}/api/v1/posts?sort=new&limit={limit}&offset={offset}"
        data = fetch_json(session, url)
        if not isinstance(data, list):
            raise RuntimeError(f"Unexpected response for posts list at offset {offset}")
        if not data:
            break
        posts.extend(data)
        # If fewer than limit returned, we've reached the end
        if len(data) < limit:
            break
        offset += limit
        time.sleep(0.2)
    return posts


def convert_html_to_markdown(html: str) -> str:
    if html_to_md is None:
        # Fallback: return raw HTML if markdownify is not available
        return html
    # Configure markdownify for better output
    return html_to_md(
        html,
        heading_style="ATX",
        code_language=False,
        convert=['a', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'strong', 'em', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'hr']
    ).strip()


def _is_netscape_cookie_file(text: str) -> bool:
    return text.lstrip().startswith("# Netscape HTTP Cookie File")


def load_netscape_cookies(session: requests.Session, text: str, allowed_domains: Iterable[str] | None = None) -> None:
    """Load cookies in Netscape cookies.txt format into the session's cookie jar.

    Each non-comment line is tab-delimited: domain, flag, path, secure, expiration, name, value.
    If allowed_domains is provided, only cookies whose domain endswith any of those are loaded.
    """
    jar = session.cookies
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith('#'):
            continue
        parts = line.split('\t')
        if len(parts) < 7:
            continue
        domain, _flag, path, _secure, _expiry, name, value = parts[:7]
        if allowed_domains:
            dom = domain.lstrip('.')
            if not any(dom == d or dom.endswith('.' + d) for d in allowed_domains):
                continue
        try:
            jar.set(name, value, domain=domain, path=path)
        except Exception:
            continue


def save_markdown(out_dir: Path, post: dict, body_md: str) -> Path:
    title = post.get("title") or post.get("social_title") or post.get("slug") or "Untitled"
    slug = post.get("slug") or slugify_filename(title)
    date = iso_to_date(post.get("post_date") or post.get("updated_at") or "")
    audience = post.get("audience") or "unknown"
    url = post.get("canonical_url") or f"{post.get('base_url','')}/p/{slug}"

    # Tags
    tags = []
    if isinstance(post.get("postTags"), list):
        for t in post["postTags"]:
            name = t.get("name") if isinstance(t, dict) else None
            if name:
                tags.append(name)

    # Front matter
    front_matter = {
        "title": title,
        "date": date,
        "slug": slug,
        "url": url,
        "audience": audience,
        "tags": tags,
    }

    # Some posts are paid; mark it
    if audience == "only_paid":
        front_matter["paywalled"] = True
        if post.get("truncated_body_text"):
            front_matter["preview_text"] = post["truncated_body_text"]

    # File name: YYYY-MM-DD-slug.md
    fname = f"{date}-{slug}.md" if date != "unknown-date" else f"{slug}.md"
    path = out_dir / fname

    # Assemble content
    fm = "---\n" + json.dumps(front_matter, ensure_ascii=False, indent=2) + "\n---\n\n"
    content = fm + body_md + "\n"
    path.write_text(content, encoding="utf-8")
    return path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", required=True, help="Base Substack URL, e.g. https://austinscholar.substack.com")
    parser.add_argument("--out", required=True, help="Output directory for Markdown files")
    parser.add_argument("--max", type=int, default=None, help="Max number of posts to fetch (for testing)")
    parser.add_argument("--delay", type=float, default=0.35, help="Delay between requests in seconds")
    parser.add_argument("--cookie", type=str, default=None, help="Raw Cookie header value for authenticated access (paste from browser)")
    parser.add_argument("--cookie-file", type=str, default=None, help="Path to a file containing a Cookie header string")
    parser.add_argument("--only-paid", action="store_true", help="Only fetch posts marked as paid (audience=only_paid)")
    parser.add_argument("--start", type=int, default=0, help="Start index within the filtered list (0-based)")
    args = parser.parse_args()

    base_url = args.base.rstrip("/")
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    session = requests.Session()
    # Set a UA to be polite and avoid bot blocks
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 SubstackScraper/1.0"
    })

    # Apply cookie if provided (enables paid content access for subscribers)
    cookie_val: str | None = None
    if args.cookie_file:
        try:
            cookie_text = Path(args.cookie_file).read_text(encoding="utf-8")
            if _is_netscape_cookie_file(cookie_text):
                # Load into cookie jar for substack domains and the specific base host
                from urllib.parse import urlparse
                base_host = (urlparse(base_url).hostname or '').lstrip('.')
                allowed = ["substack.com", base_host]
                load_netscape_cookies(session, cookie_text, allowed_domains=allowed)
            else:
                cookie_val = cookie_text.strip()
        except Exception as e:
            print(f"[WARN] Failed to read cookie file: {e}", file=sys.stderr)
    if not cookie_val and args.cookie:
        cookie_val = args.cookie.strip()
    if not cookie_val:
        cookie_val = os.environ.get("SUBSTACK_COOKIE")
    if cookie_val:
        session.headers.update({"Cookie": cookie_val})

    print(f"Listing posts from {base_url} ...", file=sys.stderr)
    posts_index = list_all_posts(base_url, session)
    print(f"Found {len(posts_index)} posts in index", file=sys.stderr)

    # Optionally filter and limit
    if args.only_paid:
        posts_index = [p for p in posts_index if p.get("audience") == "only_paid"]
    if args.start:
        posts_index = posts_index[args.start:]
    if args.max is not None:
        posts_index = posts_index[: args.max]

    # Fetch and save each post
    saved = 0
    for i, idx in enumerate(posts_index, 1):
        slug = idx.get("slug")
        if not slug:
            continue
        url = f"{base_url}/api/v1/posts/{slug}"
        # Retry with backoff on 429
        tries = 0
        while True:
            try:
                post = fetch_json(session, url)
                break
            except requests.HTTPError as e:
                status = e.response.status_code if e.response is not None else None
                if status == 429 and tries < 5:
                    wait = min(5 * (2 ** tries), 60)
                    ra = e.response.headers.get("Retry-After") if e.response is not None else None
                    if ra:
                        try:
                            wait = max(wait, float(ra))
                        except Exception:
                            pass
                    print(f"[429] Rate limited on {slug}. Sleeping {wait:.1f}s...", file=sys.stderr)
                    time.sleep(wait)
                    tries += 1
                    continue
                else:
                    print(f"[WARN] Failed to fetch {slug}: {e}", file=sys.stderr)
                    post = None
                    break

        body_html = post.get("body_html") or ""
        if not body_html:
            # Nothing to save; skip
            print(f"[WARN] Empty body for {slug}; skipping", file=sys.stderr)
            continue

        body_md = convert_html_to_markdown(body_html)
        path = save_markdown(out_dir, post, body_md)
        saved += 1
        print(f"[{i}/{len(posts_index)}] Saved: {path.relative_to(out_dir.parent)}", file=sys.stderr)
        time.sleep(max(0.0, float(args.delay)))

    print(f"Done. Saved {saved} Markdown files to {out_dir}")


if __name__ == "__main__":
    main()
