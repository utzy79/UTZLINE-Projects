# UTZLINE Site Measure — installable app

This folder is the self-contained, installable version of the app. It
was originally built as a separate "UTZLINE Projects" fork of the
older, single-plan **UTZLINE Site Measure** — as of v11, this app IS
UTZLINE Site Measure going forward, and the old single-plan version is
retired. Everything in the app itself (page title, toolbar brand,
opening screen, installed-app name) says "UTZLINE Site Measure" now.

**The repo/hosting cleanup this was waiting on is now underway
(2026-09-16):** the old retired single-plan repo (`Utzline-Site-Measure`)
is being deleted, and the live repo hosting THIS app (previously named
`UTZLINE-Projects`) is being renamed to match — `UTZLINE-Site-Measure`
— once that old name is free. Everything below already reflects that
target end state (repo name, hosted URL, and the new `viewer/`
subfolder for the standalone read-only Viewer app). If you're reading
this before finishing that rename, the live URL is still the old
`utzy79.github.io/UTZLINE-Projects/` one for now — GitHub's automatic
redirect for a renamed repo should carry old links/installs over once
it's done.

It shares the same underlying markup/photo-annotation and PDF-export
code as the old version, but adds an opening project picker. A project is a folder of
**levels** (e.g. "Level 1", "Level 2") — each level is a fully
independent plan/photo with its own markup, its own `saves/` subfolder
(the working file you reopen) and its own `pdfs/` subfolder (every PDF
you export), all kept apart by project and level name. Everything the
app needs (PDF libraries, fonts) is bundled locally; nothing loads from
the internet once it's cached.

## How the pieces fit together

There are several things in play here, same as with UTZLINE Site
Measure — easy to mix them up:

1. **The claude.ai artifact** — good for a quick look, and it falls back
   gracefully to a normal single-plan view (no project picker) on any
   browser that doesn't support the underlying folder-picker API.
   claude.ai embeds it in a cross-origin iframe, though, and Chrome
   flatly refuses to open a folder picker from a cross-origin iframe —
   so the actual per-project-folders feature only ever works once this
   app is hosted on its own domain or installed. Not what your installed
   copies run.
2. **This bundle, hosted on GitHub Pages** — the
   [`UTZLINE-Site-Measure`](https://github.com/utzy79/UTZLINE-Site-Measure) repo,
   live at
   [`https://utzy79.github.io/UTZLINE-Site-Measure/`](https://utzy79.github.io/UTZLINE-Site-Measure/) —
   separate from [`utzy79.github.io`](https://github.com/utzy79/utzy79.github.io)
   (the old `Utzline-Site-Measure` repo this name was freed from is retired
   and deleted). The standalone read-only **Viewer** app lives right
   alongside this, in the same repo's `viewer/` subfolder — see
   `../redline-viewer-pwa/README.md` for that one specifically.
   This is the real thing: fully offline-capable, and the only place the
   folder picker actually works from a browser tab.
3. **A desktop install** — Chrome/Edge's "Install this site as an app"
   pointed at that hosted URL. Just a shortcut to the same site.
4. **The Android app (the APK)** — also a thin wrapper (a Trusted Web
   Activity) around that same hosted URL, built via
   [PWABuilder](https://www.pwabuilder.com/), with its own package ID and
   its own signing key. **The APK does not contain the app's code.** It
   loads whatever is live at
   [`utzy79.github.io/UTZLINE-Site-Measure`](https://utzy79.github.io/UTZLINE-Site-Measure/)
   right now, so updating the app is a matter of updating the *files* in
   the repo, never rebuilding the APK — except when the app's identity
   changes (name, icon, package ID). If the APK was built pointing at the
   old `UTZLINE-Projects` URL, GitHub's redirect for the renamed repo
   should keep it working; rebuilding it to point at the new URL directly
   is worth doing eventually so it's not relying on that redirect forever,
   but isn't urgent.
5. **Optionally, chrome-less full-screen mode** (no browser address bar)
   for the Android app — this needs a `.well-known/assetlinks.json` on
   the domain the app claims to represent, verifying the APK's signing
   fingerprint. Since
   [`utzy79.github.io`](https://github.com/utzy79/utzy79.github.io)
   already hosts that file for UTZLINE Site Measure, the same file can
   likely just get a second entry added for this app's package
   name/fingerprint — not set up yet, ask if you want to do this once the
   APK exists.

## Updating the app (this is the main thing you'll do)

Whenever new files show up in chat as a zip:

1. Unzip it.
2. Go to the
   [`UTZLINE-Site-Measure`](https://github.com/utzy79/UTZLINE-Site-Measure) repo
   on GitHub (not `utzy79.github.io` — and note this app's files go at the
   repo **root**, not inside `viewer/`, which is the separate Viewer app).
3. Upload the files from the zip, overwriting the existing ones (drag
   them onto the repo page, or use **Add file → Upload files**), keeping
   the `icons` folder structure intact. Commit.
4. Wait about a minute for GitHub Pages to redeploy, then check it took:
   open
   [`https://utzy79.github.io/UTZLINE-Site-Measure/`](https://utzy79.github.io/UTZLINE-Site-Measure/)
   directly in a normal browser tab and confirm the change is there.
5. Get each installed copy to pick it up:
   - **Desktop install**: close and reopen it; a refresh is usually
     enough.
   - **Android app**: fully close it — swipe it away from recent apps,
     don't just background it — then reopen. If it still looks old, do
     that twice, or clear the app's cache (Settings → Apps → UTZLINE
     Projects → Storage & cache → **Clear cache**, not "Clear data" —
     that also wipes any project-root folder permission you'd granted)
     and reopen again.

No APK rebuild, no re-signing, nothing through PWABuilder — that's only
ever needed if the app's *identity* changes (name, icon, package ID),
not for ordinary fixes or features.

## Things worth knowing

- **The project picker only appears where the folder-picker API is
  actually available** — desktop Chrome/Edge, and Android Chrome (from
  a real installed/hosted context, not the claude.ai artifact). On any
  other browser, the app behaves exactly like UTZLINE Site Measure
  always has: it loads straight into a single ongoing plan, no picker,
  no per-project folders.
- **Opening a project takes you to its level list, not straight to a
  plan.** A brand-new project starts with no levels — hit **+ New
  Level** to create the first one ("Level 1", "Ground Floor", whatever
  fits the job). Each level is entirely independent: its own plan
  image, its own markup, its own save file and pdfs history.
- **"Switch level" in the toolbar** takes you back to the current
  project's level list — it'll ask you to confirm first if the current
  plan has unsaved marks on it. From there, **← All projects** steps out
  one more level to the full project picker.
- **Save always drops a fresh, timestamped PDF into the level's pdfs
  folder alongside the plan file** — not just when you explicitly
  export. If either half fails, the toast says exactly which one didn't
  land (rather than a single generic "Saved" that could paper over a
  failed PDF export), so try Save again if you see that.
- **Choosing a Projects folder is a one-time setup per device/browser
  profile.** If permission to it ever lapses (browser data cleared, a
  fresh profile), the app shows a "Reconnect" screen naming the folder
  it remembers rather than silently losing your projects.
- **Creating a project or level with a name that already exists**
  doesn't overwrite it — it silently appends a number (`Building H` →
  `Building H 2`, or `Level 1` → `Level 1 2` within the same project) so
  you never lose an existing one by mistake.

## What's in this folder

- `index.html` — the app itself
- `manifest.json`, `service-worker.js` — what makes it installable/offline
  (the version comment at the top of `service-worker.js` is a running
  changelog of every fix that's shipped)
- `icons/` — app icons
- `jspdf.umd.min.js`, `svg2pdf.umd.min.js`, `pdf.min.js`, `pdf.worker.min.js`,
  `sans.woff2`, `mono.woff2` — bundled libraries and fonts (all local, no CDN)
- `build.py` — regenerates `index.html` from the canonical claude.ai source;
  only relevant if you're working on the code directly rather than through
  chat

## Setting this up fresh (e.g. on a new account/device)

You already have this running, so you shouldn't need this — but for
reference, in case it's ever needed again from scratch:

1. Create a **public** GitHub repo (this one is
   [`UTZLINE-Site-Measure`](https://github.com/utzy79/UTZLINE-Site-Measure) —
   a different name from `utzy79.github.io`, which is already taken by
   its Digital Asset Links file). Upload every file from this bundle,
   keeping the `icons` folder structure, at the repo **root**. Add the
   Viewer app's own files (see `../redline-viewer-pwa/`) into a `viewer/`
   subfolder of this same repo alongside it.
2. Repo **Settings → Pages** → Source: **Deploy from a branch**, branch
   **main**, folder **/(root)** → Save. Wait ~1 minute for the live URL —
   [`https://utzy79.github.io/UTZLINE-Site-Measure/`](https://utzy79.github.io/UTZLINE-Site-Measure/)
   (the Viewer app then lives at that same URL's `viewer/` path).
3. Open that URL once while online (to cache it for offline use), then
   install it: on Windows/Mac, the browser's install icon in the address
   bar; on Android, Chrome's **⋮ → Add to Home screen** (or build a
   proper APK via [PWABuilder.com](https://www.pwabuilder.com/) for a
   real installable app with no browser chrome at all — its own package
   ID and signing key, kept separate from other apps).
