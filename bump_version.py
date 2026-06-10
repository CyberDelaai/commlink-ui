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
import sys
from pathlib import Path

INDEX = Path(__file__).resolve().parent / "index.html"

APP_RE = re.compile(r"(const APP_VERSION = ')(\d+)\.(\d+)\.(\d+)(';)")
COMMENT_RE = re.compile(r"(<!-- COMMLINK v)(\d+)\.(\d+)\.(\d+)( -->)")


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


if __name__ == "__main__":
    main()
