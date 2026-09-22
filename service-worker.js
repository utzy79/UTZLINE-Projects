// UTZLINE Projects offline service worker.
//
// This is a SEPARATE, independently-installable app -- the master app in the
// same family as UTZLINE Site Measure (the editor), UTZLINE Viewer (the
// read-only browser), UTZLINE Install ITP, and UTZLINE Manufacture ITP --
// its own manifest, own icon (red, to tell it apart from the editor's
// orange, the Viewer's blue, Install ITP's green, and Manufacture ITP's
// purple), own taskbar/Start-menu entry, own cache namespace
// ("utzline-projects-cache-*"). It is NOT built from source.html -- it's a
// standalone, purpose-built codebase (index.html), since it's a different
// kind of screen (project/level/room setup and joinery-item management, not
// a plan-drawing canvas). It reads and writes the SAME Projects folder
// structure the other apps use (project/level/room, the reserved
// saves/pdfs/backup convention), so nothing about how a project is
// organised changes for the other apps to keep working. See index.html's
// own top-of-file comment for the full data-format rationale.
//
// Same cache-first app shell strategy as every other app in the family: a
// small, fixed set of local files, no CDN calls once installed. Bump
// CACHE_NAME whenever index.html or any vendored asset changes, so
// installed copies pick up the update instead of serving stale files
// forever.
//
// (v1, 2026-09-22: first release -- Projects-root folder picker/reconnect
// flow (lifted from Site Measure's own detectFolderShape/listSubdirNames
// logic), and read-only Project -> Level -> Room browsing. No creation yet
// -- that's the next step in the build sequence in
// utzline-projects-v1-plan.md.)
//
// (v2, 2026-09-22: Create Project (with the same numbered-suffix dedupe as
// Site Measure's own createNewProject), a Project info dialog (Project
// name/number/Client/Builder/Site address/Project manager, extending
// project-meta.json with three new additive keys -- client/siteAddress/
// projectManager -- while keeping Site Measure's existing no/name/
// contractor keys unchanged, since Site Measure hasn't been cut over yet),
// and the single company-wide logo setting (company-logo.png, stored as a
// FILE at the Projects root, invisible to every app's own
// listSubdirNames()-based project list). Create Level/Create Room are the
// next step.)
//
// (v3, 2026-09-22: Create Level and Create Room, same numbered-suffix
// dedupe as Create Project, and the same ensureWorkFolders(saves/pdfs/
// backup) call Site Measure's own openLevelFromHandle/openRoom already
// make on every open -- so a level/room created here looks, to Site
// Measure/Viewer/both ITP apps, exactly like one Site Measure itself
// would have created. Floorplan import -- the step where a level/room
// actually gets a plan Site Measure needs to open -- is next.)
//
// (v4, 2026-09-22: Import floor plan, for both a level and a room --
// lifted from Site Measure's own loadImageFile/showCropDialog/
// pdfFileToImage/renderPdfPageMaybeTiled/renderPdfPageGrid, same crop-
// before-use interaction for a plain photo, same page picker for a multi-
// page PDF, same tiling for a genuinely oversized architectural sheet
// (PDF_TILE_MAX_DIM/PDF_IMPORT_MAX_DIM unchanged). Writes the level/room's
// save file in exactly Site Measure's own projectPayload() shape --
// objects always start empty, since annotating a plan stays Site
// Measure's job. A confirm dialog guards replacing an existing plan, same
// as Site Measure's own "Open". Only pdf.js is loaded (not jsPDF) --
// Projects V1 never exports a PDF, only imports pages from one.)
//
// (v5, 2026-09-22: Place Joinery Markers + Create Joinery Items. Once a
// level has a floor plan, a "Place joinery items" button opens a
// lightweight pan/zoom/pinch plan viewer (no drawing tools -- that stays
// Site Measure's job); tapping empty plan opens a dialog to pick or
// create a room and enter a Joinery ID + description, same numbered-
// suffix dedupe convention as everywhere else in this app. Creates the
// room folder (via the same ensureWorkFolders every other creation flow
// uses) if it's new, adds a roomlink marker object to the level's own
// save file in exactly Site Measure's own makeRoomLink() shape --
// preserving that file's existing image data untouched, only appending to
// its objects array -- and records the joinery item itself, in the exact
// shape Andrew approved (joineryId/description/level/room/status, no
// markerId), in a new project-wide joinery-items.json file. The Joinery
// Register, Joinery Item Pages, and Status Overview are next.)
//
// (v6, 2026-09-22: Joinery Register -- a flat, filterable/sortable table
// over every joinery item in the current project (reads joinery-items.json
// directly), reachable from the level list via a new "Joinery Register"
// button. Filter by level, by status, or search Joinery ID/description;
// click a column heading to sort by it, click again to reverse. Read-only
// for now -- editing a record's status/description is a Joinery Item
// Pages job, the next build-sequence step, along with Status Overview.)
//
// (v7, 2026-09-22: Joinery Item Pages + Status Overview -- the last two
// screens in Projects V1's own build sequence. Every joinery item now has
// its own page (description/level/room/status, a "View on plan" button
// that opens the level's plan canvas centred on that item's own marker,
// and placeholder sections for Site Measure overlays/Shop Drawings/
// Manufacture+Install ITP/Photos, each wired up in a later phase once
// those apps read joinery item records directly); reachable from a
// Register row, a Status Overview tile, or by tapping a marker on the
// plan canvas (which now opens the item instead of just naming it in a
// toast) -- "back" always returns to wherever it was opened from. Status
// Overview is a new project-wide grid of every joinery item with a status
// dot, reachable from the level list next to Joinery Register; every item
// reads "created" in V1 since nothing updates status yet, but the grid
// itself renders whatever's actually on each record. Read-only throughout
// -- editing a record's own fields from its page is a later step, once
// Projects V1's original 8-item build sequence gives way to the next
// phase of work.)
//
// (v8, 2026-09-22: RELEASE 3 -- "full flat structure" cutover, approved by
// Andrew after reviewing utzline-overlay-current-vs-target.md ("both are
// fine, go ahead with release 3"). Levels and Rooms are no longer real
// folders: what Levels/Rooms/joinery markers exist now lives in a new
// project-root levels.json, and each Level's one shared floorplan photo
// (never per-Room any more -- Andrew's explicit call, overriding this
// app's own earlier per-Room default) now lives in base-plan/<Level>/
// manifest.json, versioned. A project created before this cutover still
// has its old real Level/Room folders on disk, untouched forever; the
// first time such a project is opened post-cutover, its Levels/Rooms/
// markers and each Level's embedded floorplan image are read into the new
// files once (migrateLegacyLevelsIfNeeded) -- purely additive, nothing
// old is ever deleted or rewritten. The Room detail screen's own "Import
// floor plan" card is gone entirely (Rooms are pure navigation containers
// now, sharing their Level's one photo) -- superseded by a short
// explanatory note. This is the Projects-app half of a release that also
// touches Site Measure/Viewer (same folder elimination, since both apps
// currently share Projects' own per-Level/Room floorplan file) and both
// ITP apps, shipped as coordinated pieces of the same release rather than
// split further, per Andrew's explicit "I still want full structure.")
//
// (v9, 2026-09-22: CORRECTION to v8, shipped the same day after Andrew
// rejected v8's actual folder shape outright ("still dont get why your
// not using my architecture") -- v8's levels.json and base-plan/<Level>/
// sat at the project ROOT, outside his own drawn folder structure, and
// weren't something a person could find by clicking through folders.
// Andrew's own words made the real requirement explicit: "what i want is
// to go into a job, into pdfs, then into shop drawings or itps or
// whatever from there, easy for a human to find." Fixed by moving this
// same data (Levels/Rooms/markers/floorplan photo) into a new "Project
// Saves/Floor Plans/" folder -- just another human-browsable branch under
// the same "Project Saves" folder every other app already writes into --
// holding one plain file per Level, "<Project> - <Level>.json", no
// versioning (matching Andrew's own rule that only Site Measure's overlay
// saves are ever multi-file). A project already migrated under v8's
// scheme is re-migrated automatically the first time it's opened under
// v9 -- v8's levels.json/base-plan/ files are simply legacy folders/files
// from v9's point of view, safe to leave untouched. No functional/UI
// change from v8 otherwise -- same Level/Room-as-data behaviour, same
// one-shared-photo-per-Level rule, same migration-is-additive-only
// guarantee, just relocated to a place a human can actually find.)
//
// (v10, 2026-09-22: Create Project flow simplified, plus a naming/schema
// fix, both per Andrew's direct follow-up requests. The separate "New
// project name" prompt is gone -- "+ New Project" now goes straight to
// the Project Info dialog (Job number, Project name, Builder, Site
// address, Project manager, in that order), and the project FOLDER is
// built from that dialog's own Job#/Project Name fields as "<Job#> -
// <Project Name>" -- Andrew's own diagram convention (<JOB# - PROJECT
// NAME>) -- rather than a separately-typed name. Falls back to whichever
// of Job#/Name is given if only one is entered. The "Client" field is
// removed entirely (from the dialog, from project-meta.json, and from
// the level list's info preview) -- Andrew's own words: "delete client as
// this is the project name," i.e. in his workflow the client and the
// project name were always the same thing, making a separate field pure
// redundancy. Cancelling the dialog during creation now makes no folder
// at all (previously the folder already existed by the time this dialog
// opened) -- a deliberate side effect of merging the two steps into one,
// not a separate ask.)
//
// (v11, 2026-09-22: no user-visible change in this app -- a compatibility
// fix for Site Measure/Viewer's own flat-structure interop update (see
// next-version-notes.md). Each Level's own Project Saves/Floor Plans/
// file gains two additive fields this app never populates itself,
// `objects` and `savedBy` -- Site Measure's own drawn annotations for
// that Level, and who last saved them. readLevelFileByName/writeLevelFile
// now round-trip both through untouched on every read-modify-write this
// app already does (placing a marker, importing a floor plan, migrating
// a legacy project), so this app's own writes can no longer silently
// wipe out whatever Site Measure has drawn on a Level's shared plan.)
//
// (v12, 2026-09-22: real bug fix, found by Andrew via Site Measure/Viewer
// -- two joinery markers in the same room "seem to be linked" on left
// click, and deleting either one deletes both. Root cause: planNextId
// (this app's own marker-id counter) only ever counted up from 1 within a
// single page load, with no resync against markers already saved on the
// level -- so placing a marker, closing/reopening this app (a fresh load
// resets the counter back to 1), and placing another marker on the same
// level could hand out an id another marker on that same level already
// had. Site Measure/Viewer's own select/delete logic keys purely off
// `id`, so two markers sharing one id are treated as a single object by
// that code. Fixed by resyncing planNextId against every id already on
// the level, read fresh off disk, immediately before minting a new
// marker's id -- the exact same "always higher than anything already
// here" approach Site Measure's own object-id counter already uses. Site
// Measure/Viewer also shipped its own matching fix the same day
// (dedupeObjectIds in applyRestoredState, v44.5) to heal a collision
// already saved to disk by the old, unfixed version of this app -- that
// fix is what protects data placed by this app before v12.)
//
// (v13, 2026-09-22, same day: both ITP apps' own level-list exclusion
// (legacyLevelFolderNames, used by the one-time legacy-folder migration)
// now also excludes "itp-install" -- Install ITP's own project-wide data
// folder, renamed from "itp" this same day (Unified Implementation Brief
// section O) -- alongside the existing "itp"/"itp-manufacture" exclusions,
// so it's never mistaken for a pre-cutover Level folder during migration.
// No other functional change in this app.)

var ICON_VERSION = "v1";
var CACHE_NAME = "utzline-projects-cache-v13";

var PRECACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.json?v=" + ICON_VERSION,
  "./icons/icon-192.png?v=" + ICON_VERSION,
  "./icons/icon-512.png?v=" + ICON_VERSION,
  "./icons/icon-192-maskable.png?v=" + ICON_VERSION,
  "./icons/icon-512-maskable.png?v=" + ICON_VERSION
];

self.addEventListener("install", function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(PRECACHE_URLS);
    }).then(function(){
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(names){
      return Promise.all(
        names.filter(function(n){ return n !== CACHE_NAME; })
             .map(function(n){ return caches.delete(n); })
      );
    }).then(function(){
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function(event){
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(function(cached){
      var networkFetch = fetch(event.request).then(function(response){
        if (response && response.status === 200){
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, copy); });
        }
        return response;
      }).catch(function(){
        return cached;
      });
      // Cache-first for instant offline loads; refresh the cache in the
      // background whenever the network is available.
      return cached || networkFetch;
    })
  );
});
