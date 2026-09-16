# UTZLINE Viewer — installable app

This folder is the self-contained, installable **read-only viewer**
companion to **UTZLINE Site Measure**. It shares the exact same
underlying app code as the editor (see `source.html`'s own
`VIEW_ONLY_MODE` comment) — a mode flag read from the URL at load, not
a separate fork — but it is packaged here as its own completely
separate installable app: own name ("UTZLINE Viewer"), own icon (blue,
so it's easy to tell apart from the orange editor icon at a glance),
own `manifest.json`, and own offline cache. Installing it on Windows
(or any desktop) produces its own distinct taskbar/Start-menu/desktop
icon and its own window, separate from "UTZLINE Site Measure" — so a
drafting-office person can be given only this one, and they will never
see the editor's toolbar or be able to create/edit/delete anything.

It can open a project's folder to browse projects, levels, and rooms —
pan, zoom, view markups and dimensions, follow room-link markers, and
use Share/print — with every action that would create, edit, move, or
delete something blocked, both in the app's own logic (every actual
save/delete/insert/create function is a no-op in this mode) and at the
OS level (it only ever requests **read** permission on the folder you
pick, never write).

## How this relates to the editor app

Both apps are built from the one canonical source
(`/home/claude/redline-projects/source.html`) by near-identical
`build.py` scripts — this folder's own `build.py` is the same steps as
`redline-projects-pwa/build.py` (vendor the CDN libraries locally,
swap in local fonts, wrap in a full HTML document, register a service
worker), with the one meaningful difference being this app's
`manifest.json` sets `start_url` to `./index.html?viewer=1` — that's
what puts every launch of this installed app into read-only mode.
Whenever `source.html` changes, rebuild **both** apps
(`redline-projects-pwa/build.py` and this folder's `build.py`) from it,
and bump both service workers' `CACHE_NAME` (each already carries its
own running changelog at the top of `service-worker.js`, same
convention as the editor's).

## Getting this installed as its own Windows app

Settled (2026-09-16): this lives as a **subfolder of the same GitHub
Pages site** the editor uses — one repo, two separately-installable
apps — rather than a second repo:

1. In the `UTZLINE-Site-Measure` repo (the one `redline-projects-pwa/`
   is uploaded to, at its root), add everything from *this* folder
   under a `viewer/` subfolder — so it ends up live at
   `https://utzy79.github.io/UTZLINE-Site-Measure/viewer/`. Keep the
   `icons/` folder structure intact, same as the main app.
2. Open that URL once in a normal browser tab while online (to let the
   service worker cache it for offline use).
3. Install it: Chrome/Edge's install icon in the address bar ("Install
   this site as an app") while on that `viewer/` URL specifically —
   *not* the main app's URL. Because it's a different path with its
   own `manifest.json` (different `name`/`start_url`/icons), Chrome and
   Windows treat it as a wholly separate app from "UTZLINE Site
   Measure" — its own tile/shortcut, its own icon, its own window.

## Updating this app

Same process as the editor (see its own README's "Updating the app"
section) — unzip whatever's shared in chat, upload the files into this
app's own folder in the repo (overwriting existing ones, keeping
`icons/` intact), commit, wait for GitHub Pages to redeploy, then close
and reopen the installed app to pick up the change.

## Things worth knowing

- **This app never needs "readwrite" permission on anything.** The
  folder picker here always asks for read-only access — even if you
  say yes to a broader prompt by accident, every actual mutating
  function in the shared app code refuses to run while in this mode.
- **Picking a project's own folder, or even a single level's own
  folder, works too** — you don't have to pick the top-level "Projects"
  folder specifically. It detects what kind of folder you picked and
  lands you straight on the right screen (that project's level list, or
  a level's own canvas) instead of an empty or confusing list.
- **"Share" (and printing) work exactly as they do in the editor** —
  read-only mode only blocks things that would change a saved
  project's files, never viewing or exporting a copy of what's on
  screen right now.

## What's in this folder

- `index.html` — the app itself (identical app code to the editor's
  `index.html`; only ever differs in which URL launches it)
- `manifest.json`, `service-worker.js` — what makes this installable
  and offline-capable as its **own** app, separate from the editor
- `icons/` — this app's own blue-accented icon set, generated from the
  editor's orange originals so the two are easy to tell apart at a
  glance while still clearly being the same family/brand
- `jspdf.umd.min.js`, `svg2pdf.umd.min.js`, `pdf.min.js`,
  `pdf.worker.min.js`, `sans.woff2`, `mono.woff2` — bundled libraries
  and fonts (all local, no CDN), same as the editor
- `build.py` — regenerates `index.html` from the canonical source;
  only relevant if you're working on the code directly rather than
  through chat
