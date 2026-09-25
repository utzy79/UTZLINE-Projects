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

// (v14, 2026-09-23: a roomlink marker's on-plan label on this app's own
// Level Plan screen now shows only its joinery code, never "Room · Code"
// -- computed fresh at render time (roomlinkDisplayText()), matching the
// same change made across Site Measure, the Viewer, and both ITP apps.
// makeRoomLinkObject()'s own baked-in creation-time label string is
// deliberately left as-is (no migration needed, since every renderer now
// recomputes its own display text); this app's own status-word toasts
// (e.g. "Added X · Y") are unchanged, as informational/transient text
// rather than the on-plan label Andrew meant. This app was NOT given the
// new joinery-status/job-notes system built the same day in Site Measure,
// the Viewer, and both ITP apps (Andrew's own scoping named only those
// four) -- its own plan screen shows no status badge.)

// v15, 2026-09-23 (same day): this app now DOES get the joinery-status
// system -- Andrew, on the Joinery Register: "joinery register in Utzline
// Projects to be updated based on current status ... status overview
// should be linked to all parts of the chain, / shop drawings / job
// notes, itps. remove the status overview button and page." Reads the
// same shared, project-root joinery-status.json the other four apps
// already write (read-only here -- this app never advances a status
// itself). Two new pipeline stages land project-wide this same round:
// "in_manufacture" (Manufacture ITP checklist opened, not yet signed) and
// "delivered" (reserved for a future Delivery ITP app, not yet reachable
// by anything); the existing "manufactured" stage is unchanged internally
// but now displays as "Ready to dispatch" everywhere (Andrew confirmed
// its trigger stays the Manufacture ITP sign-off, only the label is new).
// The Register's Status column shows the real label + icon for each item
// (Created/Check measured/In manufacture/Ready to dispatch/Delivered/
// Installed) instead of the always-"created" joinery-items.json field,
// sortable/filterable by real pipeline order; hovering (or tapping, for
// touch) a status cell shows that item's full change history -- status,
// date, and who -- from the record's own `history` array. The Status
// Overview screen and its button are removed entirely, per Andrew's own
// instruction -- the Register plus the Joinery Item page now cover both
// jobs. The Joinery Item page's Shop drawings, Job notes (new card), and
// Manufacture + Install ITP sections are wired to real, read-only listings
// pulled straight from the same Project Saves/Shop Drawings, Project
// Saves/Job Notes, and Project Saves+PDF Files/UTZLINE ITP folders the
// other apps already write into -- no data is duplicated or migrated,
// this app just reads what's already there. Site Measure overlays and
// Photos remain unwired placeholders (not named in Andrew's own "shop
// drawings / job notes, itps" list for this round). Known, disclosed
// limitation carried over from the plan: this app has no live on-plan
// marker positions, so it can't disambiguate two joinery items that
// genuinely collide on the same (room, code) key the way Site Measure's
// resolveJoineryItemPageKey does -- joineryItemKey() here always uses the
// plain, unsuffixed key, correct for the normal (non-colliding) case.
//
// (v16 / README v11 / cache v19, 2026-09-23: NOTE ON NUMBERING -- this
// file's own "(vN, ...)" comment count (now 16), the README's own
// sequential release number (now 11), and this CACHE_NAME's own counter
// (now 19) have never been the same scale in this app -- e.g. README v9
// shipped as cache v17, README v10 as cache v18 -- so all three are called
// out explicitly here to avoid confusion for a future reader trying to
// match one to another. Two changes land in this round:
//   1. listJobNotesForItem's own jobNoteSortKey (added the same day
//      source.html/Site Measure shipped v45.8) keeps working correctly now
//      that Site Measure moved a job note's filename timestamp from a
//      PREFIX to a SUFFIX -- this app only ever READS that shared Job
//      Notes folder, so there was no filename format of its own to change,
//      only its own sort key needed updating to keep finding the
//      timestamp wherever it now sits in the name.
//   2. Andrew, verbatim: "in the project app joinery item status, we need
//      to add the following items. Delivery ITP, All itps to be viewable
//      from here (like job notes and shop drawings are)... Pin drop
//      location button that takes you to it on the map / snapshot taken
//      from the delivery itp." The Joinery Item page's ITP card (renamed
//      "ITPs", from "Manufacture + Install ITP") now also lists Delivery
//      ITP -- it turned out to need no new reader code at all, since
//      Delivery ITP already uses the exact same flat "Project Saves/
//      UTZLINE ITP/<branch>/" + "PDF Files/UTZLINE ITP/<branch>/"
//      convention Install ITP and Manufacture ITP already used here. A new
//      "Delivery location" card reads that same Delivery ITP checklist's
//      own `deliveryLocationPin`/`locationSnapshot` fields (read-only, same
//      file) and shows the pin-drop snapshot with a "Pin drop location"
//      button that jumps straight to that exact point on the item's own
//      level plan -- openPlanCanvasForLevel now accepts a raw {x,y} world
//      point as an alternative to its original {room, joineryId}
//      marker-lookup shape, since a delivery pin is placed by hand and
//      isn't guaranteed to sit exactly on the item's own roomlink marker.)
//
// (v17 / README v12 / cache v20, 2026-09-23: Andrew, on the Register's own
// status-history popup: "these status windows to show days between each
// process." A gap marker now sits between each pair of consecutive rows
// showing the elapsed time between them -- "Same day" for under a day, "1
// day" (singular) for exactly one, otherwise "N days" -- formatDaysBetween,
// wired into showStatusHistoryPop. No gap after the oldest row, and none
// at all for an item with only one history entry. The identical change was
// made the same day to Scheduler's own ported copy of this popup.)
//
// (v18 / README v13 / cache v21, 2026-09-23: Andrew, on Install ITP's new
// rework tracker: "fully trackable via this system and via utzline projects
// summary pages per project." A new, read-only "Rework" card on the
// Joinery Item page (alongside Shop drawings/Job notes/ITPs/Delivery
// location) lists every rework entry Install ITP has logged for that item
// -- cabinet number, free text, photos, and its own independent "received
// back on site" status/date -- newest first. Reads Install ITP's own
// "Install ITP Rework" flat branch via the exact same readItpChecklistRaw
// walk every other ITP branch already uses here (readInstallReworkForItem),
// so no new folder-reading code was needed. This app never writes rework
// data -- Install ITP is the only app that does.)
//
// (v19 / README v14 / cache v22, 2026-09-23: Andrew, verbatim: "Projects to
// have a rework section per project where you can press a button and see a
// status list of all reworks for that project. Sortable, filterable and
// clicking on a rework takes you to that rework. Also need the ability to
// print the rework page or email / share it." A new "Rework register"
// button on the Levels screen opens a project-wide table -- one row per
// REWORK ENTRY (not per joinery item, since one item can have several) --
// built the same filter/sort/table way the Joinery Register already is,
// reading every item's rework file via the existing readInstallReworkForItem
// reader. Clicking a row opens that item's own Joinery Item page and
// scrolls to/flashes the exact entry clicked (pendingReworkHighlightId).
// "Print / Save PDF" and "Share…" are this app's first-ever PDF EXPORT
// (everything before this only ever read PDFs, via pdf.js) -- jsPDF is
// vendored locally (jspdf.umd.min.js, same file/convention the ITP apps
// already use) rather than CDN-loaded, so it keeps working fully offline
// once installed. Print opens the generated PDF in a new tab (this app
// family has never had an in-app print stylesheet -- the browser's own PDF
// viewer handles printing from there, same as every ITP app's own "Export
// PDF" button); Share reuses Site Measure/Viewer's own isShareSupported()/
// shareFile()/browserDownloadBlob() pattern verbatim, so the Share button
// only appears where the Web Share API can actually take a file, falling
// back to a plain download elsewhere. Neither the new-tab-PDF design for
// Print nor the Share-with-download-fallback behavior was separately
// confirmed with Andrew beyond his own wording above -- both simply carry
// over this app family's own existing conventions.)
//
// (v20 / README v15 / cache v23, 2026-09-23: Andrew, verbatim: "Where there
// is a table it needs to open the full width of the screen. To minimise
// scrolling." The Joinery Register and Rework Register screens now stretch
// to the full viewport width (a new .wide-table CSS class, max-width:none,
// applied via the same override pattern .plan-canvas-screen already
// established for the plan canvas) instead of being capped to this app's
// usual 640px centered content column -- their tables already fill their
// own container at width:100%, so the container was the only thing holding
// them back. No other screen's width changed.)
//
// (v21 / README v16 / cache v24, 2026-09-23: Andrew, verbatim: "Manufacture
// status needs to be split up into 2 parts. We need a machined and a
// manufactured tab. All traceable by user name. Machined to have its own
// app. Called machine schedule. This is where the machinist can mark off a
// joinery item as complete. It will add their name and date time to the
// system." A new "machined" stage is inserted into the shared joinery-status
// pipeline, between "in_manufacture" and "manufactured": Created(0) ->
// Check measured(1) -> In manufacture(2) -> Machined(3, NEW, gear icon) ->
// Ready to dispatch/"manufactured"(4, was 3) -> Delivered(5, was 4) ->
// Installed(6, was 5). "machined" is written exclusively by the brand-new
// sibling app UTZLINE Machine Schedule (the machinist marks an item
// complete there and it stamps their PIN-verified name + date/time into
// joinery-status.json, same as every other stage's history entry) -- this
// app stays a strictly read-only consumer of it, same relationship it
// already has with every other stage. joineryStatusRank/Label/Icon are the
// only functions touched; the Register's status filter is built dynamically
// from whatever statuses are actually present in a project's data (sorted
// by rank), so "Machined" appears there and in the hover/tap status-history
// popup automatically, with no separate dropdown/list to update. Also fixed
// a now-stale hardcoded rank threshold in computeDelayInfo -- its "hasn't
// reached installed yet" check compared against the OLD rank(installed)==5,
// which needed bumping to 6 to match installed's new rank; the other
// threshold (rank(in_manufacture)==2) was untouched since that stage's rank
// didn't move.)
//
// (v22 / README v17 / cache v25, 2026-09-23: Andrew, verbatim: "we will also
// add a Solid Surface schedule that is a separate app. so when putting on
// the joinery item we can have a tick box for has Solid Surface. this then
// puts it on its own schedule." A new plain boolean field on the
// joinery-items.json record, `hasSolidSurface` (absent/missing on every item
// written before this existed, same as reading missing as false everywhere
// it's checked) -- unlike every field the Add Joinery Item dialog itself
// sets (Level/Room/Joinery ID/Description/Work order #, all set once and
// never touched again), and unlike the work order # backfill (a narrow,
// fill-in-once-only exception), this is a genuine two-way toggle: a new
// "Has Solid Surface" checkbox on the Joinery Item page
// (setJoineryItemHasSolidSurface, same find-by-(level,room,joineryId)-
// triple/rewrite-whole-file pattern as setJoineryItemWorkOrderNo) can be
// switched on or off at any time, on any item old or new, and takes effect
// immediately with no separate Save step. No by/at attribution is recorded
// for this field -- this app has no notion of "who is using it" anywhere in
// its own code (the status-history popup's `by` values come from Site
// Measure/the ITPs writing joinery-status.json, never from anything this
// app itself captures), and this is a plain item property, not a pipeline
// status change, so a bare boolean is all that's added. The Joinery
// Register's Joinery ID column now shows a small diamond badge (◆) next to
// the ID for any item with the flag set, so Andrew can see at a glance
// which items have solid surface, without opening each one -- a new glyph,
// distinct from every existing status icon (📏🏭⚙️📦🚚🏆). This field is the
// hand-off point for the brand-new sibling app UTZLINE Solid Surface
// Schedule, which reads it to build its own per-item schedule; this app
// remains the sole writer of joinery-items.json, same as always.)
//
// (v23 / README v18 / cache v26, 2026-09-24: Andrew, verbatim: "in utzline
// projects, need option to edit joinery item (if wrong information put in)
// this will need a pin to change for the current user. and changes will be
// traceable." Two changes, shipped together:
//
// 1) The full shared name+PIN identity system this app already had (added
// v10, unchanged in shape) is now load-bearing rather than purely
// informational -- it's what "the current user" in Andrew's request above
// actually means. No new registry, database, or numberpad was built for
// this: same utzline-identity IndexedDB device pointer, same
// utzline-users.csv at the Projects-root level, same on-screen numberpad,
// same "the button is the selector" #identitySelector pattern already
// documented under v10. The identity-selector machinery
// (populateIdentitySelector/beginPinVerifyFlow/beginAddNewIdentityFlow) was
// generalised to bind to ANY <select> element, not just the Settings
// screen's own one, so the new Edit joinery item dialog (below) can carry
// its own copy of the exact same "sign in" flow without duplicating it.
//
// 2) A real Edit joinery item flow on the Joinery Item page, replacing BOTH
// the old one-way "Add work order #" backfill prompt (which only ever
// filled in a MISSING value and could never change an existing one) and the
// old always-live, no-attribution "Has Solid Surface" checkbox. Both are
// gone; a single "Edit item" button now opens a dialog covering exactly the
// three fields Andrew confirmed are editable -- Description, Work order #,
// Has Solid Surface -- with Level/Room/Joinery ID shown dimmed for context
// only, never editable (every sibling file in this family -- joinery-
// status.json, joinery-schedule.json, machining-flags.json, solid-surface-
// schedule.json, rework records -- is keyed off that exact (level, room,
// joineryId) triple; re-keying all of them safely is out of scope, so a
// wrong one means delete-and-recreate the item instead). Saving requires
// TWO things, not one: the device must already be signed in (via the
// identity system above -- the dialog's own selector prompts for this
// inline if it isn't), AND that person's PIN must be re-entered on the
// on-screen numberpad at the exact moment of saving -- being signed in on
// the device alone is deliberately not enough ("need a pin to change for
// the current user"). A cancelled or wrong PIN rejects the whole edit with
// nothing written, same shake-and-retry numberpad UX as every other PIN
// step in this app family. A save with no actual changes (dialog opened
// and closed, or reopened and re-saved with identical values) skips the
// PIN step and the write entirely -- no dialog round-trip should be able to
// pollute the log with a no-op entry.
//
// Traceability: a successful edit appends ONE entry to a new editHistory[]
// array on that joinery-items.json record -- `{ at: <ISO timestamp>,
// by: <confirmed signed-in name>, changes: [{ field, from, to }, ...] }` --
// covering every field actually changed in that one save (a batch edit of
// e.g. both Description and Work order # together is one history event
// with two `changes` entries, not two separate events); a field left
// unchanged is never included. This mirrors joinery-status.json's own
// established `history[]` per-item convention, just scoped to this app's
// own record. A new "Edit history" card on the Joinery Item page lists
// every past edit, newest first, date/time + who + old -> new per field
// (reusing this page's existing .doc-row-style list convention, not the
// Register's hover popup, since this lives on a dedicated page rather than
// a table cell); an item with no editHistory yet shows a plain "No edits
// yet" line, same empty-state convention as every other card here.)
var ICON_VERSION = "v1";
var CACHE_NAME = "utzline-projects-cache-v30";

var PRECACHE_URLS = [
  "./",
  "./index.html",
  "./jspdf.umd.min.js",
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
