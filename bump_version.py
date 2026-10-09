#!/usr/bin/env python3
"""Bump the COMMLINK app version (X.Y.Z).

Usage:
    python3 bump_version.py {x|y|z}

Bumps the chosen component and resets the lower ones to 0 (semver-style):
    x  ->  (X+1).0.0
    y  ->  X.(Y+1).0
    z  ->  X.Y.(Z+1)

Updates BOTH places that carry the version in index.html, keeping them in sync:
  - the source-of-truth   const APP_VERSION = 'X.Y.Z';
  - the mirrored line-1    <!-- COMMLINK vX.Y.Z -->
"""
import re
import subprocess
import sys
from datetime import date
from pathlib import Path

INDEX = Path(__file__).resolve().parent / "index.html"

APP_RE = re.compile(r"(const APP_VERSION = ')(\d+)\.(\d+)\.(\d+)(';)")
COMMENT_RE = re.compile(r"(<!-- COMMLINK v)(\d+)\.(\d+)\.(\d+)( -->)")

# ---- SEO dates -------------------------------------------------------------
# A bump is a release, so it also stamps the release where crawlers read it:
# "softwareVersion" / "dateModified" in the index.html JSON-LD, and this tool's
# <lastmod> in its own sitemap.xml and in the hub's (../cyberdeck-tools/) — the
# hub sitemap is the one the root robots.txt actually points search engines at.
TOOL_DIR = Path(__file__).resolve().parent
TOOL_URL = "https://cyberdeck.tools/commlink-ui/"
SITEMAPS = [TOOL_DIR / "sitemap.xml", TOOL_DIR.parent / "cyberdeck-tools" / "sitemap.xml"]


def stamp_seo(version):
    today = date.today().isoformat()
    index = TOOL_DIR / "index.html"
    text = index.read_text(encoding="utf-8")
    text, n_ver = re.subn(r'("softwareVersion": ")[^"]*(")', rf"\g<1>{version}\g<2>", text)
    text, n_date = re.subn(r'("dateModified": ")[^"]*(")', rf"\g<1>{today}\g<2>", text)
    index.write_text(text, encoding="utf-8")
    if n_ver != 1 or n_date != 1:
        print('warning: JSON-LD "softwareVersion" / "dateModified" not found/updated in index.html')

    lastmod_re = re.compile(rf"(<loc>{re.escape(TOOL_URL)}</loc>\s*<lastmod>)[^<]*(</lastmod>)")
    for path in SITEMAPS:
        if not path.exists():
            print(f"note: {path} not found, skipped")
            continue
        text, n = lastmod_re.subn(rf"\g<1>{today}\g<2>", path.read_text(encoding="utf-8"))
        if n == 0:
            print(f"note: {TOOL_URL} is not listed in {path.parent.name}/sitemap.xml, skipped")
            continue
        path.write_text(text, encoding="utf-8")
        print(f"lastmod: {today} in {path.parent.name}/sitemap.xml")
        if path.parent.name == "cyberdeck-tools":
            print("reminder: the hub repo (cyberdeck-tools) changed too - commit it separately")
    print(f"after pushing + deploy: python ../cyberdeck-tools/indexnow.py {TOOL_URL}  (pings Bing / Yandex)")


def main():
    arg = sys.argv[1].lower() if len(sys.argv) == 2 else ""
    if arg not in ("x", "y", "z"):
        sys.exit("usage: python3 bump_version.py {x|y|z}")

    text = INDEX.read_text(encoding="utf-8")
    m = APP_RE.search(text)
    if not m:
        sys.exit("error: APP_VERSION not found in index.html")

    x, y, z = (int(m.group(i)) for i in (2, 3, 4))
    old = f"{x}.{y}.{z}"
    if arg == "x":
        x, y, z = x + 1, 0, 0
    elif arg == "y":
        y, z = y + 1, 0
    else:
        z += 1
    new = f"{x}.{y}.{z}"

    text, n_app = APP_RE.subn(rf"\g<1>{new}\g<5>", text)
    text, n_comment = COMMENT_RE.subn(rf"\g<1>{new}\g<5>", text)
    INDEX.write_text(text, encoding="utf-8")

    print(f"version: {old} -> {new}")
    if n_comment == 0:
        print("warning: line-1 '<!-- COMMLINK v... -->' comment not found/updated")
    stamp_seo(new)
    # the per-language pages are copies of index.html: rebuild them with the new version / dates
    subprocess.run([sys.executable, str(TOOL_DIR / "make_langs.py")], check=False)


if __name__ == "__main__":
    main()
