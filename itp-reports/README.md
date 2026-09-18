# UTZLINE ITP — installable app

This folder is the self-contained, installable **UTZLINE ITP** app —
a third app in the same family as **UTZLINE Site Measure** (the editor)
and **UTZLINE Viewer** (the read-only browser), for filling in and
signing off joinery installation checklists on site, usually on a phone
or tablet.

**Unlike the Viewer, this is NOT built from `source.html`.** The editor
and Viewer share one canonical source file because they're really the
same app (a plan-drawing canvas) in two modes. ITP is a different kind
of screen entirely — a checklist form, not a canvas — so it's its own
small, purpose-built codebase (`index.html`, ~1400 lines) with its own
`manifest.json` and `service-worker.js`. There's no `build.py` here and
nothing to "rebuild" when you edit it directly; whatever's in
`index.html` is what ships.

It reads the **same Projects folder** the other two apps use — the
same project → level → room folder structure — so nothing about how a
project is organised has to change to start using it. It never touches
a room's own `saves`/`pdfs`/`backup` content; it only reads a project's
`project-meta.json` (written by Site Measure's own "Project Info"
screen, if filled in) to auto-fill the title block, and it keeps its
own checklist data in a project-wide `itp` folder it creates alongside
the level folders (see "Where things are saved" below).

## What it does

1. Choose the Projects folder (same one as the other two apps) — the
   folder handle is remembered, same reconnect-after-permission-reset
   flow as the others.
2. Browse Project → Level → Room, same navigation as the Viewer.
3. Inside a room, see a simple list of joinery items that already have
   a checklist started, or start a new one by typing its joinery
   number ("+ New Joinery Item").
4. Fill in the checklist: the title block (Project No./Name/Head
   Contractor/Level/Room/Joinery No.) auto-fills itself; the 16
   install-quality checks are Yes/No/N/A with a comment field each,
   taken verbatim from Metro Joinery's own paper template; there's a
   free-text Notes/Comments/Missing Parts box; and two sign-off blocks
   ("Subcontractor Rep. (Joinery Installer)" and "Metro Site
   Supervisor") each with a Name field, a Date field that fills itself
   in with today's date the moment a name is typed (but never
   overwrites a date you've already changed), and a signature pad you
   sign with a finger or stylus.
5. It autosaves a few seconds after any change, and there's an
   explicit Save button too.
6. "Export PDF" renders the whole checklist — including both
   signatures — to a PDF and saves it straight into the project's
   `itp` folder. Exporting again later adds a new timestamped PDF
   rather than overwriting the last one, so a history of exports for
   the same item is kept.

## Where things are saved

```
<Projects folder>/
  <Project>/
    project-meta.json          <- written by Site Measure, read-only here
    <Level>/...                <- Site Measure's own level folders
    itp/                       <- this app's own folder, project-wide
      <Level>/
        <Room>/
          <joinery-no>.json            <- this item's saved checklist state
          <joinery-no>_<timestamp>.pdf <- one file per export, never overwritten
```

The `itp` folder sits directly under the **project's** own folder, as
a sibling of the level folders — not nested inside any one level — so
every joinery item across the whole project ends up under one place,
itself organised by level and room to mirror the plan. Site Measure's
own level list knows to skip a folder literally named `itp` so it never
shows up there mislabeled as if it were a level.

## Getting this installed as its own app

Same pattern as the Viewer: a subfolder of the same GitHub Pages site
the editor and Viewer already live on, so all three install as
separate, independent apps from one repo:

1. In the `UTZLINE-Site-Measure` repo, add everything from this folder
   under an
   [`itp-reports/`](https://github.com/utzy79/UTZLINE-Site-Measure/tree/main/itp-reports)
   subfolder — so it ends up live at
   [`https://utzy79.github.io/UTZLINE-Site-Measure/itp-reports/`](https://utzy79.github.io/UTZLINE-Site-Measure/itp-reports/).
   Keep the `icons/` folder structure intact.
2. Open that URL once in a normal browser tab while online, so the
   service worker can cache it for offline use.
3. Install it: Chrome/Edge's install icon in the address bar ("Install
   this site as an app") while on the `itp-reports/` URL specifically.
   Because it has its own `manifest.json` (its own name and icons —
   green, to tell it apart from the editor's orange and the Viewer's
   blue), Chrome and Windows/Android treat it as a wholly separate,
   independently installable app.
4. On a phone or tablet — the main way this one's meant to be used —
   "Install this site as an app" is under the browser's own menu
   (Chrome: ⋮ → "Add to Home screen" / "Install app").

## Updating this app

Same process as the other two: unzip whatever's shared in chat, upload
the files into this app's own `itp-reports/` folder in the repo
(overwriting existing ones, keeping `icons/` intact), commit, wait for
GitHub Pages to redeploy, then close and reopen the installed app to
pick up the change. Bump `service-worker.js`'s `CACHE_NAME` (and the version note
at the top of that file) with every change that ships, same convention
as the other two apps, so installed copies actually pick up the update
instead of serving a stale cached copy forever.

## Things worth knowing

- **A joinery item is just a number you type in**, not a marker placed
  on the plan — there's no on-plan picking in this app. If two people
  type slightly different numbers for what's meant to be the same
  item ("J101" vs "J-101"), they'll end up as two separate checklists;
  agreeing on a numbering convention on site avoids that.
- **Signing is finger/stylus on the device's own touchscreen** — the
  signature pad is a plain draw area with a "Clear signature" button
  per role; there's no typed/typed-name-as-signature fallback.
- **Project No./Name/Head Contractor only show up if Site Measure's
  own "Project Info" has been filled in for that project.** If it
  hasn't, those title-block fields just show as blank on the checklist
  and in the exported PDF — nothing breaks, but it's worth filling
  that in from Site Measure first for a tidy-looking export.
- **Exported PDFs accumulate.** Re-exporting the same joinery item
  after fixing something adds a new timestamped file rather than
  replacing the old one, so the `itp` folder can build up multiple
  PDFs per item over time — that's deliberate (a paper trail of every
  export), not a bug, but worth knowing if you're tidying up the
  folder later.

## What's in this folder

- `index.html` — the whole app: markup, styles, and logic in one file
- `manifest.json`, `service-worker.js` — what makes this installable
  and offline-capable as its own app
- `icons/` — this app's own green-accented icon set
- `jspdf.umd.min.js`, `sans.woff2`, `mono.woff2` — bundled library and
  fonts (all local, no CDN) — no SVG/PDF-import libraries are needed
  here since this app never opens an existing PDF or SVG, unlike the
  editor and Viewer
