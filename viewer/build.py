#!/usr/bin/env python3
"""
Rebuilds /home/claude/redline-viewer-pwa/index.html from the exact same
canonical Artifact source as the main editor PWA
(/home/claude/redline-projects-pwa/), at /home/claude/redline-projects/
source.html.

This is a SEPARATE, independently-installable PWA -- not a mode of the main
app reachable only from inside it. The two apps share one source file (the
read-only "viewer" build is a mode flag read from the URL at load, see
VIEW_ONLY_MODE's own comment in source.html, not a fork) but are packaged
into two entirely separate app shells, each with its own manifest.json
(different name, start_url, and icons) and its own service-worker.js/cache
namespace, so installing this one produces its own distinct icon and window
on the Windows taskbar/Start menu/desktop -- a drafting-office viewer who
should never be able to edit a plan installs ONLY this one and never even
sees the main app's editing toolbar.

The only functional difference this build script's OUTPUT has from the main
app's is manifest.json's start_url carrying "?viewer=1" -- that's what
switches VIEW_ONLY_MODE on at boot for every launch of this installed app.
Everything else below mirrors redline-projects-pwa/build.py step for step;
see that script's own top-of-file comment for the full rationale behind
each step (vendoring CDN scripts, local fonts, wrapping in a full document,
the icon/manifest cache-busting query strings).

Run this whenever source.html changes (the same run that updates the main
app's own build), then bump this file's own service-worker.js CACHE_NAME.
"""

import json
import re
import sys
from pathlib import Path

SRC = Path("/home/claude/redline-projects/source.html")
OUT = Path(__file__).parent / "index.html"
MANIFEST = Path(__file__).parent / "manifest.json"

APP_VERSION_RE = re.compile(r'var APP_VERSION = "(v\d+)"')

CDN_REPLACEMENTS = [
    (
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/4.2.1/jspdf.umd.min.js",
        "./jspdf.umd.min.js",
    ),
    (
        "https://cdn.jsdelivr.net/npm/svg2pdf.js@2.8.1/dist/svg2pdf.umd.min.js",
        "./svg2pdf.umd.min.js",
    ),
    (
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js",
        "./pdf.min.js",
    ),
]

GOOGLE_FONTS_LINK_RE = re.compile(
    r'<link rel="stylesheet" href="https://fonts\.googleapis\.com/css2\?family=IBM\+Plex[^"]*">\n?'
)

LOCAL_FONT_FACE_BLOCK = (
    "<style>\n"
    "@font-face{font-family:'IBM Plex Mono';font-style:normal;font-weight:500;"
    "src:url('./mono.woff2') format('woff2');}\n"
    "@font-face{font-family:'IBM Plex Sans';font-style:normal;font-weight:500;"
    "src:url('./sans.woff2') format('woff2');}\n"
    "</style>\n"
)

def pwa_head_tags(version):
    # See redline-projects-pwa/build.py's own comment on why every
    # icon-bearing href needs a "?v=<version>" cache-buster -- same
    # reasoning, own cache namespace/icon files.
    return (
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        f'<link rel="manifest" href="./manifest.json?v={version}">\n'
        '<meta name="theme-color" content="#16283a">\n'
        f'<link rel="icon" type="image/png" sizes="512x512" href="./icons/icon-512.png?v={version}">\n'
        f'<link rel="apple-touch-icon" href="./icons/icon-192.png?v={version}">\n'
        '<meta name="mobile-web-app-capable" content="yes">\n'
        '<meta name="apple-mobile-web-app-capable" content="yes">\n'
        '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n'
        '<meta name="apple-mobile-web-app-title" content="UTZLINE Viewer">\n'
    )

SERVICE_WORKER_SCRIPT = (
    "\n\n<script>\n"
    'if ("serviceWorker" in navigator) {\n'
    '  window.addEventListener("load", function () {\n'
    '    navigator.serviceWorker.register("./service-worker.js").catch(function (err) {\n'
    '      console.warn("UTZLINE Viewer: service worker registration failed", err);\n'
    "    });\n"
    "  });\n"
    "}\n"
    "</script>\n"
)


def build():
    if not SRC.exists():
        sys.exit(f"Source not found: {SRC}")
    html = SRC.read_text(encoding="utf-8")

    version_match = APP_VERSION_RE.search(html)
    if not version_match:
        sys.exit("Could not find `var APP_VERSION = \"vNN\";` in source.html")
    version = version_match.group(1)

    if not html.lstrip().startswith("<title>"):
        sys.exit(
            "source.html doesn't start with <title> as expected -- "
            "the fragment shape may have changed; check this script's "
            "assumptions before proceeding."
        )

    # 1. Vendor the CDN script URLs to local relative paths.
    for remote, local in CDN_REPLACEMENTS:
        if remote not in html:
            sys.exit(f"Expected CDN URL not found in source.html: {remote}")
        html = html.replace(remote, local)

    # 2. Swap the Google Fonts <link> for local @font-face rules.
    if not GOOGLE_FONTS_LINK_RE.search(html):
        sys.exit("Expected Google Fonts <link> not found in source.html")
    html = GOOGLE_FONTS_LINK_RE.sub(LOCAL_FONT_FACE_BLOCK, html, count=1)

    # 3. Insert the PWA head tags right after the <title> line.
    title_line_end = html.index("\n", html.index("<title>")) + 1
    html = html[:title_line_end] + pwa_head_tags(version) + html[title_line_end:]

    # 4. Wrap in a full document (see main app's build.py for why the
    #    explicit charset comes first).
    html = '<!DOCTYPE html>\n<html lang="en">\n<meta charset="utf-8">\n' + html + "\n</html>\n"

    # 5. Append the service worker registration, before the closing </html>.
    html = html.rstrip()
    assert html.endswith("</html>")
    html = html[: -len("</html>")] + SERVICE_WORKER_SCRIPT + "</html>\n"

    OUT.write_text(html, encoding="utf-8")
    print(f"Wrote {OUT} ({len(html)} bytes)")

    # 6. Keep manifest.json's icon URLs cache-busted the same way.
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    for icon in manifest.get("icons", []):
        icon["src"] = icon["src"].split("?", 1)[0] + f"?v={version}"
    MANIFEST.write_text(
        json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Wrote {MANIFEST} (icons cache-busted to v={version})")


if __name__ == "__main__":
    build()
