# UTZLINE Projects — installable app

This folder is the self-contained, installable version of **UTZLINE
Projects** — a completely separate app from **UTZLINE Site Measure**.
It shares the same underlying markup/photo-annotation and PDF-export
code, but adds an opening project picker: every project gets its own
folder on your device, with a `saves/` subfolder (the working file you
reopen) and a `pdfs/` subfolder (every PDF you export), kept apart by
project name. Everything the app needs (PDF libraries, fonts) is
bundled locally; nothing loads from the internet once it's cached.

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
2. **This bundle, hosted on GitHub Pages** — its own repo, separate from
   both `Utzline-Site-Measure` and `utzy79.github.io`. This is the real
   thing: fully offline-capable, and the only place the folder picker
   actually works from a browser tab.
3. **A desktop install** — Chrome/Edge's "Install this site as an app"
   pointed at that hosted URL. Just a shortcut to the same site.
4. **The Android app (the APK)** — also a thin wrapper (a Trusted Web
   Activity) around that same hosted URL, built via PWABuilder, with its
   own package ID and its own signing key (kept completely separate from
   UTZLINE Site Measure's APK/keystore — these are two unrelated apps as
   far as Android is concerned). **The APK does not contain the app's
   code.** It loads whatever is live on the hosted URL, so updating the
   app is a matter of updating the *files* in the repo, never rebuilding
   the APK — except when the app's identity changes (name, icon, package
   ID).
5. **Optionally, chrome-less full-screen mode** (no browser address bar)
   for the Android app — this needs a `.well-known/assetlinks.json` on
   the domain the app claims to represent, verifying the APK's signing
   fingerprint. Since `utzy79.github.io` already hosts that file for
   UTZLINE Site Measure, the same file can likely just get a second
   entry added for this app's package name/fingerprint — not set up yet,
   ask if you want to do this once the APK exists.

## Updating the app (this is the main thing you'll do)

Whenever new files show up in chat as a zip:

1. Unzip it.
2. Go to this app's GitHub repo (not `Utzline-Site-Measure`, not
   `utzy79.github.io`).
3. Upload the files from the zip, overwriting the existing ones (drag
   them onto the repo page, or use **Add file → Upload files**), keeping
   the `icons` folder structure intact. Commit.
4. Wait about a minute for GitHub Pages to redeploy, then check it took:
   open the live URL directly in a normal browser tab and confirm the
   change is there.
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
- **"Switch project" in the toolbar** takes you back to the project
  picker at any point — it'll ask you to confirm first if the current
  plan has unsaved marks on it.
- **Choosing a Projects folder is a one-time setup per device/browser
  profile.** If permission to it ever lapses (browser data cleared, a
  fresh profile), the app shows a "Reconnect" screen naming the folder
  it remembers rather than silently losing your projects.
- **Creating a project with a name that already exists** doesn't
  overwrite it — it silently appends a number (`Building H` →
  `Building H 2`) so you never lose an existing project by mistake.

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

1. Create a **public** GitHub repo (any name, just not
   `Utzline-Site-Measure` or `utzy79.github.io` — those are already
   taken by the other app and its Digital Asset Links file). Upload
   every file from this bundle, keeping the `icons` folder structure.
2. Repo **Settings → Pages** → Source: **Deploy from a branch**, branch
   **main**, folder **/(root)** → Save. Wait ~1 minute for the live URL.
3. Open that URL once while online (to cache it for offline use), then
   install it: on Windows/Mac, the browser's install icon in the address
   bar; on Android, Chrome's **⋮ → Add to Home screen** (or build a
   proper APK via PWABuilder.com for a real installable app with no
   browser chrome at all — its own package ID and signing key, kept
   separate from UTZLINE Site Measure's).
