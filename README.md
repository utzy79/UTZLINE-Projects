# UTZLINE Projects — installable app

**Current version: v10** (its own independent version line, separate from Site Measure/Viewer's and both ITP apps' — bump this line every time a new build ships.)

**v10 (2026-09-23):** added the shared name+PIN identity selector, per
Andrew's own follow-up request, verbatim: *"implement the username as per
the delivery itp throughout the entire system, but instead of it opening a
popup, the button is the selector, when you pick a name it opens a
numberpad to input the pin (4 digit pin)."* Projects had no identity/name
feature of its own before this, so this is a brand-new addition here (not a
replacement of an older, simpler one, unlike the sibling apps this pattern
started on). A new `<select id="identitySelector">` on the Projects screen
— the button IS the selector — lists every known name plus "+ Add a new
name…"; picking an existing name opens an on-screen 0–9 numberpad to enter
its 4-digit PIN (wrong PIN shakes/clears for another attempt, right PIN
signs this device in); picking "+ Add a new name…" prompts for the name as
text, then the same numberpad twice (choose, then confirm) to set its PIN,
then a "show me in" app-tickbox list ("Projects" pre-checked) for Andrew's
own admin reference. Reads and writes the exact same shared registry every
other UTZLINE app in the family uses — the `utzline-identity` IndexedDB
database (one per-device name pointer, same DB/store/key names, since
IndexedDB is scoped per-origin) and `utzline-users.csv` at the Projects-root
level (`Name,PIN,ShowInApps`, plain CSV so Andrew can edit it directly) — so
a name set in Site Measure, Viewer, either ITP app, or here shows up
everywhere else too, and vice versa. This app doesn't yet stamp the signed-
in name into any saved file (nothing here plays Delivery ITP's "savedBy"
role yet), so for now this only gets a name recognised consistently across
the family; the hint text next to the selector says so honestly rather than
implying an attribution this build doesn't do.

**v9 (2026-09-23):** two additions, both requested alongside the new
UTZLINE Delivery ITP app. (1) **Delivery status surfaced read-only from
UTZLINE Scheduler's own `joinery-schedule.json`** — a "Required delivery"
line on the Joinery Item page and a new sortable "Delivery" column on the
Joinery Register, each showing the delivery date plus a delay cue ("On
track" / "Manufacture start overdue" / "Delivery overdue"), computed with
the exact same wording/severity as Scheduler's own delay logic so the two
apps never drift; an item with nothing scheduled yet shows a plain dash,
never an error. Projects never writes to this file — same read-only
relationship Scheduler already has with Projects' own files, just now
symmetric. (2) **A way to backfill a missing work order #** — the
one-and-only, deliberately narrow exception to this app's own
"every joinery-item field is set once at creation, never edited again"
rule: an item currently showing the "—" placeholder (created before the
work order # field existed) gets a small "Add work order #" action on
both the Register and the Joinery Item page; using it saves the value
directly to that item's record. An item that already has one shows no
edit action anywhere, ever — the "set once" guarantee holds for every
other case.

**v8 (2026-09-23):** added a required **Work order #** field to the Add
Joinery Item dialog, per Andrew's request ("Every single joinery item gets
its own work order #also. That we put in manually when as part of the
initial add joinery step"). Like every other field on that dialog
(Level/Room/Joinery ID/Description), it's set once at creation and has no
edit affordance afterward — no joinery item field anywhere in this app
family does. It's required going forward for every new item; an item
created before this field existed simply shows "—" wherever it's
displayed, with no retroactive backfill. It's stored on the item record as
`workOrderNo`, shown on the Joinery Item page and as a new sortable/
searchable column in the Joinery Register, and the same UTZLINE Scheduler
app reads it (display-only) for its own tables and search.

This folder is the self-contained, installable **UTZLINE Projects** app — the
**master application** in the UTZLINE family. It's where a project, its
levels and rooms, its metadata, and (eventually) every joinery item come
into existence; Site Measure, Viewer, Install ITP, Manufacture ITP and the
future Progress Viewer all read what Projects creates, but none of them
create it themselves once Projects has shipped in full (see "What's not
built yet" below — until then, Site Measure keeps its own creation UI).

**Unlike Site Measure/Viewer, this is NOT built from `source.html`.**
Site Measure and Viewer share one canonical source file because they're
really the same app (a plan-drawing canvas) in two modes. Projects is a
different kind of screen entirely — project/level/room setup and joinery-
item management, not a canvas — so, same reasoning as Install ITP's own
original build, it's its own small, purpose-built codebase (`index.html`)
with its own `manifest.json` and `service-worker.js`. There's no `build.py`
here and nothing to "rebuild" when you edit it directly; whatever's in
`index.html` is what ships.

It reads and writes the **same Projects folder** every other app in the
family uses — the same project → level → room folder structure, the same
reserved `saves`/`pdfs`/`backup` convention — so nothing about how a
project is organised has to change for any of the other apps to keep
working. See `index.html`'s own top-of-file comment for the full
folder-layout diagram and data-format rationale, and
`utzline-projects-v1-plan.md` (in the project) for the build plan this app
is being built against.

## What it does

1. Choose the Projects folder (same one as every other app) — the folder
   handle is remembered, same reconnect-after-permission-reset flow as the
   others.
2. Browse Project → Level → Room. Levels and rooms show whether they
   already have a floorplan saved (a simple yes/no status), and a project
   with existing `project-meta.json` shows a read-only preview of its
   metadata (Project No./Name/Client/Builder/Site address/Project manager —
   older projects only have No./Name/Builder, which is all that shows).
3. **Create Project** — types a name, gets a numbered suffix if it collides
   with an existing project, then is prompted straight away for its
   **Project info** (Project name/number/Client/Builder/Site address/
   Project manager — skippable, editable later from the level list via
   "Edit project info"). Writes `project-meta.json` with those six fields
   plus Site Measure's own three original keys (`no`/`name`/`contractor`)
   kept exactly as-is, since Site Measure hasn't been cut over yet and
   still reads/writes that file too.
4. **Company logo** — a single company-wide logo, set once from the
   project list screen ("Choose logo image"), stored as `company-logo.png`
   at the Projects root (a file, not a folder, so it never shows up in
   anyone's project list). Not per-project — the same logo applies to
   every project.

5. **Create Level / Create Room** — same numbered-suffix dedupe as Create
   Project, and the same `ensureWorkFolders` call (making `saves`/`pdfs`/
   `backup` exist) that Site Measure's own `openLevelFromHandle`/`openRoom`
   already make on every open — so a level/room created here looks, to Site
   Measure, Viewer, and both ITP apps, exactly like one Site Measure itself
   would have created.

6. **Import floor plan** — for both a level and a room: pick a photo (crop
   before use, or "Use whole photo") or a PDF (page picker if it has more
   than one page). A genuinely oversized architectural sheet is split into
   tiles exactly like Site Measure's own "Open" already does (same
   `PDF_TILE_MAX_DIM`/`PDF_IMPORT_MAX_DIM` constants), so a large CAD-
   exported scan imported here looks and measures identically once Site
   Measure opens it. Writes the level/room's own save file in exactly Site
   Measure's `projectPayload()` shape — this is the interop contract every
   other app in the family depends on, so it's reproduced byte-for-byte,
   objects always starting empty (annotating a plan stays Site Measure's
   job). Replacing an existing plan asks for confirmation first, same as
   Site Measure's own "Open". A static, non-interactive preview confirms
   the import landed correctly — the real pan/zoom/marker-drop canvas is
   the next build-sequence step.

7. **Place joinery items** — once a level has a floor plan, a "Place
   joinery items" button opens a lightweight, read/write plan viewer: pan
   by dragging, zoom by pinch/scroll wheel, no drawing tools (that stays
   Site Measure's own job — this is a marker-drop screen, not a canvas).
   Tapping an empty spot on the plan opens a dialog to pick an existing
   room or create a new one, then enter a Joinery ID, description, and
   (required) work order #. Creating a new room uses the same
   `ensureWorkFolders` call as every other creation flow here. The marker
   itself is added to the level's own save file's `objects` array in
   exactly Site Measure's own `makeRoomLink()` shape — the level's existing
   image data, style, and any other objects are read and preserved
   untouched, only the new marker is appended — so a level marked up here
   looks, to Site Measure, exactly like one Site Measure itself would have
   marked up. Joinery IDs are deduped against siblings already in the same
   room with the same numbered-suffix convention used everywhere else in
   this app. The joinery item's own record — `{joineryId, description,
   level, room, status: "created", workOrderNo}` — is written to a new
   project-wide `joinery-items.json` file (see "Where things are saved"
   below); a marker and its record correlate by matching `(level, room,
   joineryId)` against the marker's own `(level, roomName, joineryCode)`.

8. **Joinery Register** — a "Joinery Register" button on the level list
   opens a flat table of every joinery item in the current project, pulled
   straight from `joinery-items.json` regardless of which level or room
   each one is on. Filter by level, by status, or search Joinery ID/
   description/work order #; click any column heading to sort by it, click
   again to reverse. Read-only for now — editing a record's status or
   description from here is a Joinery Item Pages job (next).

9. **Joinery Item Pages** — every joinery item now has its own page:
   description, work order #, level, room, and status, plus a "View on
   plan" button that opens the level's plan canvas centred on that item's
   own marker.
   Reachable three ways — clicking a row in the Joinery Register, clicking
   a tile in Status Overview, or tapping the item's own marker on the plan
   canvas (which used to just name it in a toast; now it opens the page).
   "Back" always returns to wherever the page was opened from. Four
   sections on the page — Site Measure overlays, Shop drawings,
   Manufacture + Install ITP, Photos — are placeholders for now, each
   waiting on the sibling app it names being updated to key off joinery
   item records directly instead of its own separate data.

10. **Status Overview** — a "Status Overview" button next to Joinery
    Register on the level list opens a project-wide grid of every joinery
    item, one tile each, with a coloured status dot, its Joinery ID,
    level/room, and description. Every item reads "created" in V1, since
    no app updates status yet, but the grid renders whatever's actually on
    each record — it's not hardcoded to that one value. Clicking a tile
    opens that item's own page.

This completes Projects V1's original 8-item build sequence (see
`utzline-projects-v1-plan.md`) — Create Project, Levels, Rooms, floor plan
import, Place Joinery Markers, Create Joinery Items, the Joinery Register,
and now Joinery Item Pages + Status Overview. Every screen so far is
read/write for its own data but read-only across the others (a Joinery
Item page doesn't yet let you edit its own description or status in
place, for instance) — the next phase of work is the parity check and
cutover: bringing Projects to full parity with Site Measure's current
creation flows, then, in one step, **removing Site Measure's own New
Project/Level/Room, floorplan-import, "Add joinery item here", and Project
Info UI** — not gradually (see the data standard's decision #12).

## Where things are saved

```
<Projects folder>/
  company-logo.png            <- single company-wide logo, set from this
                                  app; a FILE, not a folder, so it's
                                  invisible to every app's own project list
  <Project>/
    project-meta.json          <- {no, name, contractor, client, siteAddress,
                                   projectManager}, read and written by this
                                   app (Site Measure still writes the first
                                   three keys too, until the cutover)
    joinery-items.json          <- flat array of every joinery item record
                                   in this project: {joineryId, description,
                                   level, room, status, workOrderNo} -- no
                                   markerId; a record correlates to its
                                   marker by matching (level, room,
                                   joineryId) against the marker's own
                                   (level, roomName, joineryCode). Storage
                                   location is this app's own choice --
                                   Andrew's approved answer specified the
                                   record shape, not where to keep it.
                                   workOrderNo added 2026-09-23, required
                                   for new items going forward; items
                                   created before then simply lack the key.
    <Level>/
      saves/, pdfs/, backup/   <- this level's own floorplan + objects
      <Room>/
        saves/, pdfs/, backup/ <- same shape, one folder deeper
    itp-install/               <- Install ITP's own project-wide folder (renamed from "itp" 2026-09-22)
    itp-manufacture/           <- Manufacture ITP's own project-wide folder
```

Levels and rooms are read with `{create: false}` throughout — this version
never creates a folder or file, so pointing it at a real, existing Projects
folder is safe to try immediately.

## Getting this installed as its own app

**This app lives in its own separate GitHub repository** — not a
subfolder of Site Measure's, the Viewer's, or any sibling app's repo.
Every app in the UTZLINE family (Site Measure, Viewer, Install ITP,
Manufacture ITP, UTZLINE Projects, UTZLINE Scheduler, UTZLINE Delivery
ITP) is its own repo with its own GitHub Pages URL.

1. In this app's own repo, add every file from this bundle at the repo
   root (not inside a subfolder) — keep the `icons/` folder structure
   intact. It'll go live at that repo's own GitHub Pages URL.
2. Open that URL once in a normal browser tab while online, so the service
   worker can cache it for offline use.
3. Install it: Chrome/Edge's install icon in the address bar ("Install this
   site as an app"). Because it has its own `manifest.json` (its own name
   and icons — red, to tell it apart from every sibling app's own colour),
   Chrome and Windows/Android treat it as a wholly separate, independently
   installable app.
4. On a phone or tablet, "Install this site as an app" is under the
   browser's own menu (Chrome: menu -> "Add to Home screen" / "Install app").

## Updating this app

Same process every time a new build ships: unzip whatever's shared in
chat, upload the files into this app's own repo root (overwriting existing
ones, keeping `icons/` intact), commit, wait for GitHub Pages to redeploy,
then close and reopen the installed app to pick up the change. **Bump the
"Current version" line at the top of this README (with a dated changelog
entry) and `service-worker.js`'s `CACHE_NAME` every single time a change
ships** — both need to move together, or installed copies keep serving a
stale cached build and this README stops being a reliable record of
what's actually live.

## What's in this folder

- `index.html` — the whole app: markup, styles, and logic in one file
- `manifest.json`, `service-worker.js` — what makes this installable and
  offline-capable as its own app
- `icons/` — this app's own red-accented icon set
