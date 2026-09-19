// UTZLINE Site Measure offline service worker.
// This app was originally a separate "UTZLINE Projects" fork of UTZLINE
// Site Measure (the original redline-pwa) at v40 of that app -- same
// plan/photo markup engine, plus a per-project folder system layered on
// top. Kept under its own cache namespace ("utzline-projects-cache-*" up
// through v10, not "redline-cache-*") and its own versioning, starting
// fresh at v1, so nothing about this app's releases got tangled up with
// the original app's while both existed side by side. As of v11 this app
// IS UTZLINE Site Measure going forward -- the old single-plan version is
// retired -- and the cache namespace below is renamed to match
// ("utzline-sitemeasure-cache-*"), which also has the practical effect of
// discarding every previously-cached file under the old name on next
// install (see the "activate" handler further down, which deletes any
// cache not matching the current CACHE_NAME regardless of naming scheme).
//
// Cache-first app shell: everything the app needs is a small, fixed set of
// local files (no CDN calls once installed), so a simple versioned cache
// with a network-falling-back-to-cache strategy is all this needs.
//
// Bump CACHE_NAME whenever index.html or any vendored asset changes, so
// installed copies pick up the update instead of serving stale files forever.
//
// (v1: forked from UTZLINE Site Measure v40. Adds per-project folders: on
// first launch, choose one root "Projects" folder (File System Access API --
// desktop AND Android Chrome, see source.html for why Android is included
// here unlike the original app's single backup-folder feature); every
// project you create or open gets its own named subfolder under that root,
// itself containing a saves/ subfolder (one continuously-updated
// <ProjectName>.utzline.json, loaded automatically next time you open that
// project) and a pdfs/ subfolder (every Save PDF export for that project).
// The app now always opens to a project picker -- choose an existing
// project or start a new one -- instead of straight into a single ongoing
// plan. manifest.json and the icon files already carry the same
// "?v=<version>" cache-busting query string the original app's v40 fix
// introduced, so this app never inherits the stale-favicon/install-icon bug
// that fix was written for.)
//
// (v2: a project is now itself a folder of LEVELS -- e.g. "Level 1",
// "Level 2" -- each a fully independent plan/photo with its own markup, own
// save file, and own pdfs history in its own subfolder under the project.
// Opening a project leads to ITS level picker, not straight to a canvas.
// "Save" now always drops a fresh timestamped PDF alongside the plan file
// on every save, not just when explicitly exporting -- and reports the two
// outcomes as one combined toast instead of two that could step on each
// other, so a failed PDF export is never silently indistinguishable from a
// successful one. Also adds an explicit <meta charset="utf-8">, since the
// app's curly quotes/arrows/etc were only ever rendering correctly by
// accident, dependent on the host's Content-Type header carrying the right
// charset.)
//
// (v3: a save/PDF-export failure toast now includes the actual underlying
// error (name/message, or this app's own short error code) instead of just
// "try again" -- found necessary after a real-world report of a save
// silently only writing the plan file, not the PDF, on a large real plan
// (a ~6000x4239px architectural drawing) that couldn't be reproduced in
// testing; showing the real error is the fastest way to pin down a failure
// that only happens on specific real hardware/plans, without needing
// devtools access on a phone.)
//
// (v4: press-and-hold a project or level row to delete it, gated behind
// two sequential confirmations (recursively removes that folder and
// everything saved in it -- there is no undo). The "Switch level" toolbar
// button is renamed "Switch project / level" to better describe what it
// actually does. Fixed a naming bug: a level's plan name is now always
// "<Project>_<Level>" (previously just "<Level>"), and -- the actual
// reported bug -- bringing in a new photo/PDF while a level is open no
// longer clobbers that name with the imported file's own filename; only
// the artwork changes, the level's identity doesn't.)
//
// (v5: FOUND THE REAL CAUSE of the long-unreproducible "PDF export fails
// on real hardware" bug -- every exported/auto-backup filename embedded a
// colon in its timestamp (e.g. "14:23:38"), which a real
// FileSystemDirectoryHandle.getFileHandle() rejects outright with a
// TypeError ("Name is not allowed") on every platform, not just Windows.
// The sandboxed test harness's fake filesystem never validated names at
// all, so this sailed through every test run and only ever broke against
// a real folder handle -- exactly what a real device exercises and a
// file:// test never does. Timestamps now use hyphens. Also: press-and-
// hold to delete wasn't registering reliably on Android -- .project-row
// never set its own touch-action, so Android Chrome's own gesture
// handling could still race the custom JS long-press timer and cancel it
// early; explicit touch-action:manipulation plus swallowing the native
// long-press contextmenu event fixes that. The confirm dialog's OK button
// now says "Confirm" instead of the leftover "Open anyway" (a label that
// only ever fit its original single use before other flows started
// reusing the same dialog). The exit button moved to the very end of the
// toolbar's second row, after auto-backup.)
//
// (v6: press-and-hold-to-delete now registers reliably on Android (v5
// fixed that), but a real report showed the two confirmations going
// through with nothing actually deleted -- the working theory is that a
// real device's picked folder can be backed by Android's own Storage
// Access Framework rather than a plain filesystem, and removeEntry() on
// one of those can resolve successfully without actually removing
// anything. Delete now double-checks afterward (same instinct as this
// app's save-verification logic) and reports an honest failure instead of
// a false "Deleted" if the item is still there.)
//
// (v7: a real report showed NO toast at all after both delete
// confirmations -- neither success nor failure -- meaning some step in
// v6's removeEntry-then-verify chain was apparently never settling either
// way on that device. Both async steps are now raced against a timeout
// (10s for the delete itself, 6s for the follow-up existence check), so a
// hung filesystem call can no longer leave the user staring at nothing: a
// hung removeEntry() now reports a clear timeout failure, and a hung
// verification step still reports success -- just honestly flagged as
// unverified -- rather than blocking on a check that isn't essential to
// trust in the first place. Declining either delete confirmation now also
// shows an explicit "Delete cancelled." toast, so a deliberate cancel is
// never visually identical to the flow going nowhere.)
//
// (v8: FOUND THE REAL CAUSE of "no toast at all" -- the toast element and
// the project/level picker screen ("the gate") both had z-index:30, and
// the gate sits later in the page, so on a tie the gate always painted
// ON TOP of the toast. Every delete happens from that exact picker screen,
// so every delete toast -- success, decline, failure, v7's new timeout
// messages, all the way back to v4 -- was being generated and shown
// correctly, then rendered invisibly underneath the picker's own opaque
// background the whole time. The same blind spot explains why toolbar
// buttons whose feedback is a toast (e.g. "check for update") looked
// broken while the picker was on screen. The toast now renders above both
// the picker and the confirm/rename dialogs. Also added: two more
// .catch()s in the delete flow for an exception thrown on the way to
// removeEntry() rather than returned as a rejected promise (previously an
// unhandled rejection with well and truly no toast at all), and an
// app-wide "unhandledrejection" listener as a last-resort net that turns
// any future uncaught promise failure, anywhere in the app, into a visible
// toast instead of silence.)
//
// (v9: v8's toast fix worked -- a real device now shows "Couldn't delete
// "test" (17) -- try again." instead of nothing. That's genuine progress
// (a real, specific browser error, not a mystery hang) but "(17)" itself
// is useless: it's a DOMException's legacy NUMERIC .code -- here 17,
// TypeMismatchError -- and describeError() was checking err.code before
// err.name/err.message, so the number won out over the actually-useful
// name. This app's own rejection shapes (timeout:delete,
// delete_did_not_take, etc.) always give .code as a STRING, so those still
// take priority; a native browser error now falls through to
// "Name: message" first, with its numeric code only as a last resort.)
//
// (v10: v9's error message showed the real culprit -- deleting "test"
// failed with "TypeMismatchError: The path supplied exists, but was not
// an entry of matching type." That's the exact error Chromium normally
// throws from getFileHandle()/getDirectoryHandle() when a name resolves
// to an entry of the wrong kind -- coming out of removeEntry() strongly
// suggests the browser's own ONE-SHOT recursive removal
// (removeEntry(name, {recursive:true})) is doing an internal walk-and-
// check that trips over a kind mismatch partway through on this
// particular Android SAF-backed folder. Recursive removal in a single
// call is also a far less-traveled corner of the API than a plain
// single-entry removeEntry() -- exactly the kind of path more likely to
// have platform-specific bugs. Delete no longer ever calls
// removeEntry(name, {recursive:true}) at all: it now walks the folder
// itself (every file removed directly, every subfolder emptied out
// first) and removes each already-empty entry one at a time -- the
// simplest, most ordinary shape the API has. The delete timeout widened
// from 10s to 25s to match: this makes many small real filesystem calls
// instead of one atomic one, and a project with a lot of saved plans and
// exported PDFs can genuinely take longer to walk that way.)
// (v11: this app -- formerly the separate "UTZLINE Projects" fork -- is now
// UTZLINE Site Measure itself; the old single-plan version is retired.
// Purely a branding/identity change (page title, toolbar brand, project-
// gate heading, PWA manifest name/short_name, this cache namespace) -- no
// functional change to how projects, levels, saving, or delete work. The
// saved-project file extension deliberately stays .utzline.json rather
// than changing again: there's no reason to touch a working file format
// just for a rename, and the app already carries one legacy extension
// (.redline.json) for backward compatibility -- a third would be
// unnecessary churn for zero benefit.)
// (v12: two fixes. First, bringing a plan/photo into an open level (Open,
// drag-drop, Insert image, or paste) now writes straight into that level's
// own saves/ folder immediately, instead of only ever getting saved once
// you hit Save yourself or whenever the periodic auto-backup timer next
// happens to fire -- closes a real gap where an imported plan could be
// lost entirely if you backed out (or switched level/project) in that
// window. Second, the exported PDF/PNG's identification moved into a
// single white title-block bar across the BOTTOM of the page (plan name
// on the left, the app's logo and save date/time on the right) instead of
// being split between a dark banner across the top -- which used to sit
// on top of, and partially hide, the plan's own content -- and a small
// watermark tucked in the bottom-right corner.)
// (v13: a level's own folder can now optionally hold ROOMS too -- project /
// level / room -- each its own fully independent mini-plan (own markup, own
// save file, own pdfs history), reached via a new "Rooms" toolbar button
// that only appears once a level is open. A level always keeps hosting its
// own main floor plan exactly as before regardless -- rooms are purely
// additive, for when that single plan isn't enough on its own (a kitchen or
// bathroom that needs its own detailed annotated photo/drawing), and a
// level with no rooms works completely unchanged.)
// (v14: fixes a real large-format plan coming in blurry/unreadable. A big
// PDF sheet (A1/A0 and similar) used to get downscaled to fit inside one
// safety-capped canvas -- for a true A0 sheet that meant roughly 300dpi
// dropping to around 125dpi, soft enough that a dimension or room label
// zoomed in on turned to mush. Opening a plan now renders an oversized page
// as a GRID OF TILES instead -- several modestly-sized images laid
// edge-to-edge -- so every tile still renders at full, uncapped resolution;
// nothing about placing/measuring/exporting a plan changes, it just looks
// sharp now even on a full-size architectural sheet. Mirror and Save PDF
// both updated to handle a tiled plan correctly too. "Insert image" (a
// second reference photo/PDF placed as its own resizable object) is
// unaffected -- it keeps its original behaviour exactly as before.)
// (v15: the export title-block bar's title and logo are now about 4x
// bigger, scaling with the export size the same way as before -- the old
// sizing looked fine on a normal photo but read tiny on a real full-size
// drawing sheet. Also fixes a layout bug the bigger text uncovered: a
// longer project/level(/room) name could run into the save-timestamp block
// on the right. The title now measures the space actually left of the
// timestamp and shrinks to fit, only truncating with an ellipsis as a last
// resort for a name that still wouldn't fit even then -- it no longer
// overlaps anything.)
// (v16: fixes "images are unreadable" in an exported PDF -- a pasted-in
// reference photo used to be flattened into the same shared page-wide
// canvas as the base plan, so it only ever got as many pixels as its tiny
// printed footprint at the page's overall resolution, no matter how many
// megapixels the original camera photo had. Each reference photo is now
// embedded as its own separate image at its real native resolution
// (capped generously just for file size), so zooming into one in a PDF
// viewer now shows genuine extra detail instead of the same blur no matter
// how far you zoom. The base plan itself is unaffected.)
//
// (v17: a batch of smaller fixes/requests. Enter in a text/dimension/
// callout label now always inserts a newline (no modifier needed) instead
// of committing -- Shift+Enter already did this but is impossible to
// trigger on a touch keyboard, which is exactly why it "didn't work" on a
// tablet; Escape/tapping away still commits. Inserting or pasting in a
// photo now opens a quick crop step first (drag to adjust, or skip for the
// full photo), and a fresh photo now lands one layer below existing
// annotations by default, with a "Bring to front" option in its
// lock/mirror popover if you need it on top. The Layers panel's Delete
// button is gone (Delete still works from the properties panel, the
// popover, or the Delete/Backspace key) so an accidental tap there can't
// remove something by mistake. A dimension's "Label side" control is now a
// one-tap Top/Bottom (or Left/Right) button instead of a dropdown.
// Imported photos can now have an optional coloured border (a swatch row
// in the properties panel, off by default) layered on top of the existing
// white/black halo, and plain Text objects can now optionally get the same
// border-and-background box a Callout always has (also off by default).
// Manually dragging a dimension's label off its default spot and then
// later stretching the line no longer strands the label in its old
// position -- it now follows the line's centre by a fixed offset, without
// rotating or resizing with it. A new toolbar toggle snaps new/stretched
// dimension, line and angle legs to level/plumb without needing to hold
// Shift, for tablet/mobile use. Auto-backup for an open project/level now
// writes real rolling timestamped snapshots into that level's own new
// "backup" folder (a sibling of its saves/pdfs folders), capped to the 10
// most recent, instead of just re-saving the same file with no history --
// and the auto-backup toggle's tooltip now shows the last backup's date
// and time on hover.)
//
// (v18: another batch of fixes/requests. A dimension's Label side buttons
// always read Left-then-Right or Top-then-Bottom in the correct physical
// order now, for either draw direction (previously a line drawn one way
// could show "Right | Left" backwards); a Top/Bottom pair also stacks
// vertically instead of sitting side-by-side. Rectangles can now have an
// optional background fill colour (a swatch row in the properties panel,
// same pattern as the existing border-colour options); as a rule across
// every object type, lowering an object's opacity now only fades its fill
// (or halo background, for text/callouts) -- borders and text/labels stay
// fully opaque so a faded object never becomes harder to read (dimension/
// line/angle lines, which have no separate fill, still fade as a whole,
// unchanged). A new Pan tool (hand icon, or press H) lets you drag to move
// around the canvas without holding Space first. The old auto-backup
// folder-picker (superseded once per-level backup folders shipped in v17)
// has been removed. Exported PDF photos are now pre-compressed as JPEG at
// a fixed quality before embedding -- previously jsPDF silently ignored
// its own compression setting for any raw canvas/image source and always
// embedded at maximum quality, which is why PDF exports with several
// photos could come out much larger than expected; typical photo-heavy
// exports are now roughly half the size with no visible quality loss. The
// on-screen Share button's "current view" image snapshot now renders at
// the viewport's true on-screen resolution (previously it drifted with
// zoom level and could look soft once zoomed in past 100%) and now carries
// the same plan-name/logo/timestamp watermark bar Save PDF/PNG/Share PDF
// already have. The New toolbar button no longer clears the current plan
// in place when a project/level is open -- a plain tap now safely routes
// to the level picker instead (so a moment's delay before saving can no
// longer let an auto-backup tick silently overwrite real content with
// nothing to recover from); the old in-place clear is still available via
// press-and-hold/right-click for the rarer case of wanting to reuse the
// same level's folder. The plain single-file mode (no project/level system
// in use) is unaffected.)
//
// (v19: rooms can now link back to a spot on their level's own floor plan.
// A small clickable circle marker can sit on the level's own plan; double-
// clicking it (or its right-click/long-press popover's new "Open room" row)
// jumps straight to that room's own separate canvas. Long-pressing (or
// right-clicking) anywhere on the level's own plan -- over the base photo,
// alongside the existing Mirror option, or on genuinely empty canvas --
// now also offers "Add a room here": confirm, name the new room, and it's
// created with a marker already placed at that exact spot, linking the two
// together from the start. If a room is later deleted from the Rooms list,
// its old marker is cleaned up (with a toast) the next time it's opened,
// rather than silently creating a new empty room under the old name. Only
// available from a level's own main plan -- not inside a room, and not in
// the plain single-file mode, which has no rooms concept at all.)
//
// (v20: fixes a real reported bug -- the "current view" share snapshot's
// title-block bar badly over-truncated the plan title while leaving a large
// empty gap before the timestamp, because it sized itself off content
// dimensions that vary with zoom instead of the physical, zoom-invariant
// viewport size (see computeViewSnapshotBounds's own comment); an extreme
// zoom-in that leaves no room at all for a title now omits it instead of
// ever overlapping the timestamp. Adds a read-only "viewer" mode -- see
// VIEW_ONLY_MODE's own comment -- packaged as its own separately
// installable app (UTZLINE Viewer, own icon/manifest/cache, see
// redline-viewer-pwa/) for the drafting office to browse projects/levels/
// rooms, pan/zoom, and Share/print, with every mutation path (drawing,
// delete/lock/mirror/edit, New/Save/Insert image, auto-backup) defensively
// blocked at its actual chokepoint, plus the OS-level folder permission
// itself requested as read-only rather than read-write. Both this app's own
// folder picker and the viewer's now also detect when a picked folder is
// actually a single project's or single level's own folder (rather than a
// root folder of projects) and land directly on that level's canvas or
// project's level list instead of an empty/confusing project list --
// handles the real limitation that a folder handle can't identify its own
// parent, so this only works looking at what's INSIDE the picked folder.)
//
// (v21: adds a Viewer-only "jump to any room" dropdown (grouped by level,
// reads live off the project's own folders) and a Viewer-only blue re-skin
// -- accent color and in-app logo -- so the Viewer reads as visually
// distinct beyond just its own taskbar icon and text label. Both are
// gated on VIEW_ONLY_MODE and never appear/apply in this editor build.)
//
// (v22: CRITICAL SAFETY FIX -- confirmAndDeleteEntry (the long-press/
// right-click "Delete" on a project/level/room row) had NO VIEW_ONLY_MODE
// check at all, so the Viewer could call the exact same real, recursive
// removeEntry() the editor uses and actually destroy real project files
// (reported by Andrew, 2026-09-17). Now intercepted at the very top in
// viewer mode and replaced with a purely local, non-destructive "hide from
// my list" (hideEntryForViewerInstead/restoreHiddenEntryForViewer,
// idb-persisted per device, filtered in populate*List via
// splitHiddenNames, with a "Show hidden" toggle to bring one back) --
// never touches the real folder. Also hides "+ New Project/Level/Room" in
// the Viewer (there's no legitimate create/import action in read-only
// mode -- was previously visible and silently rejected with a generic
// failure toast) and fixes the project-gate's own big title to follow
// VIEW_ONLY_MODE the same way the small header brand name already did.)
// (v23: two changes, both requested by Andrew, 2026-09-17 --
// (1) the "jump to any room" dropdown (level>room tree, shipped Viewer-
// only in v21) is now available in this editor too -- it's pure
// navigation, nothing about it was ever gated on VIEW_ONLY_MODE
// underneath, so refreshRoomJumpMenu() no longer excludes the editor.
// (2) CRITICAL DATA-LOSS FIX -- editing several rooms/levels in one visit
// used to only ever keep whichever one happened to be open at the moment
// Save was actually clicked: navigating on to a different room/level (via
// the Rooms/Levels list, the room-jump dropdown, "Rooms", or "Switch
// project/level") reloaded the destination straight over the in-memory
// plan with no save first, silently discarding everything drawn on the one
// just left -- the direct list/dropdown routes gave no warning at all, and
// "Rooms"/"Switch project/level" only ever reminded you to save first
// without actually doing it. Fixed with a new saveActiveWorkBeforeLeaving(),
// wired into openLevel()/openRoom() (the chokepoints every navigation route
// funnels through) plus switchProject()/openRoomsPicker(), so leaving a
// room or level now always auto-saves it first, silently, before anything
// gets overwritten -- editing multiple rooms and pressing Save once now
// keeps every one of them, not just the last. A companion fix
// (clearActiveWorkInMemory()) also closes a related gap this uncovered:
// stepping back out to a list without opening something new used to leave
// the just-saved room/level's content lingering in memory, which a later
// navigation's auto-save could then misattribute into a completely
// different level's file -- state.objects is now cleared at that point too.)
// (v24: follow-up to v23's auto-save-on-leave fix, requested by Andrew the
// same day once he'd thought through the consequences -- always silently
// auto-saving on the way out means a genuine mistake (an accidental delete,
// a stray edit) now gets permanently written with nothing left to catch it,
// where previously a mistake could still be walked back by simply not
// saving. saveActiveWorkBeforeLeaving() now asks first -- "Save changes to
// '<name>' before leaving?" -- whenever there's a real unsaved edit
// (tracked by a new unsavedSinceLastSave flag, set on every actual edit via
// pushHistory() and cleared on save/fresh-load), before writing anything;
// choosing Cancel stays right where you are, plan and all, exactly as it
// was, so a mistake can be reviewed or undone before trying again. Every
// navigation route (Levels/Rooms list rows, the room-jump dropdown, "Rooms",
// "Switch project/level") shares this one gate, so the confirm shows up
// consistently everywhere leaving-with-unsaved-changes can happen. Purely
// cosmetic/navigational moves (nothing drawn since the last save, or
// stepping around while nothing was ever open) still go straight through
// with no prompt at all -- this only ever interrupts a genuine unsaved
// change.)
// (v25: toolbar layout fix, requested by Andrew the same day -- "the menu
// bar keeps jumping when a button is pressed, can it be locked into one /
// 2 rows (based on screen size) file related on the top / first bar and
// drawing related on the second bar." Root cause: the toolbar already had
// two named halves in the markup (file/plan actions, drawing tools) but
// they were flattened into ONE flex-wrap:wrap container at every width
// except a narrow phone -- so toggling any button's visibility (Save/
// Rooms/Switch project/the room-jump dropdown/Share/exit all show or hide
// depending on what's open) could shift exactly where that shared row
// wrapped, visibly reflowing every button after it. Fixed by making the
// two rows permanently, independently fixed at every screen width -- file
// actions on top, drawing tools below, exactly as requested -- each its
// own non-wrapping strip that scrolls sideways on its own if it doesn't
// fit, so a button appearing or disappearing can only ever affect its own
// row's scroll room, never reflow the other row or change the row count.
// A generous width threshold (2200px) merges both rows onto one line on
// genuinely huge monitors, where there's real spare room for that rather
// than it being a coincidence of one particular window size.)
// (v26: two fixes, same day. (1) New batch PDF export -- "Export all room
// PDFs" (on the Rooms picker screen) and "Export all PDFs (whole project)"
// (on the Levels picker screen) re-render and save a fresh PDF for every
// room/level in one pass, straight into each one's own pdfs folder --
// without opening each one by hand and hitting Save, which is all the
// ordinary Save button has ever been able to do (one room/level at a time,
// whichever's actually open). (2) Real bug fix: the "Share current view"
// title-block bar's logo+timestamp block could spill off the LEFT edge of
// a tightly-zoomed crop -- it was sized off the physical screen (a
// constant ~28-64 CSS px converted to world units via the current zoom,
// floored at 44 world units so it never read illegibly small), but that
// floor had nothing to do with how much world-unit width the current crop
// actually had, so a tight enough zoom could need MORE width than the crop
// itself contained. Anchored to the right edge, the logo -- right at that
// edge -- mostly stayed put, while the timestamp text -- furthest from it
// -- spilled badly off the left (reported by Andrew as "logo size seems ok
// but text is no good"). Fixed by shrinking the block (down to an 8-world-
// unit floor) whenever its natural footprint would exceed the crop's own
// width.)
//
// (v27: two UI/UX fixes requested directly by Andrew. (1) The toolbar's
// horizontal scrollbar ("the slider on the menu bar") is now a slim,
// rounded, theme-colored bar on a transparent track instead of the
// platform's stock grey scrollbar, which looked out of place against the
// app's own rounded UI -- still a full drag affordance on desktop/tablet,
// just restyled rather than removed (phone widths still hide it entirely,
// unchanged). (2) "My projects" -- a Viewer-only, ADDITIONAL personal list
// of individually-added project/level folders, layered above the existing
// single-Projects-root flow (which is completely unchanged): "the open
// files on the viewer needs the ability to look in different locations,
// think of it like a import function." This was the "personal My projects
// list" idea noted as pending since v20 -- the drafting office works
// across different project managers whose projects live in different
// locations, which a single remembered root doesn't fit. Each entry is a
// remembered folder handle plus a typed label (a folder can't reveal its
// own parent path, and real project folders are routinely all named
// identically "UTZLINE" in the field, so the label is what actually
// distinguishes one job from another) -- shown even with zero Projects
// root chosen at all, added via "+ Add a project" (shape-detected the same
// way the existing folder picker already is), opened directly from its own
// stored handle, and removed (press-and-hold, same gesture as every other
// row) without ever touching the real folder on disk. Purely additive --
// this app's own single-root flow is untouched either way.)
// (v28: BUG FIX, reported by Andrew: "the new export all pdf button worked,
// but exported them with none of the dimentions etc on them, just the
// background image." Root cause: the batch-export renderer
// (renderAndWriteBatchPdf, added in v26) borrowed the shared `state` object
// for each room/level in turn, but the actual export pipeline
// (renderExportPdfBlob/renderExportBlob) builds the exported page from the
// LIVE ON-SCREEN DOM (cloneWorldForExport), not from `state` directly --
// mutating `state` alone never touched it. Every batch-exported file was
// silently rendering whatever the canvas happened to still be showing from
// the last time a real room/level was actually opened before stepping out
// to the picker screen, frozen and identical across the whole batch,
// completely disconnected from each room's own saved content -- which is
// exactly why the picture came through (real, if stale) while the
// dimensions/text/etc from each room's ACTUAL save file never did. Fixed by
// actually pushing the borrowed state into the DOM (applyImageToDom +
// renderAll) before rendering each one, and again after restoring
// afterward. New regression test run_batch_pdf_visual_content.js inspects
// the DOM synchronously at the moment of each render (proven, via a
// deliberate before/after check, to actually fail without this fix) --
// the older run_batch_pdf_export.js only ever checked PDF file counts,
// which never caught this since a real room happened to still be on
// screen during that test's own run.)
// (v29: real bug fixed, reported by Andrew: "personal 'my projects' in the
// viewer does not work. does it need a certain folder structure." Root
// cause: v27's "My projects" only ever recognized a folder as a "level" or
// a "project" -- a "root" shape (a folder that itself contains SEVERAL
// project folders, exactly what one project manager's own Projects folder
// looks like, which is the real shape of "different project managers,
// different locations") was silently treated as a plain "project". Opening
// it then listed that root's real project folders as if they were LEVELS
// of one project; tapping one failed with a generic "Couldn't open" toast,
// since a project folder has no saves/pdfs/backup of its own two layers
// down for ensureWorkFolders to find -- and nothing in the UI ever
// explained why, or what folder shape was actually expected. Fixed by
// giving "root" its own real kind: opening a "root" entry now lands on an
// actual project list (populateProjectList against that root, under its own
// typed label), exactly like the existing single-Projects-root flow already
// does when you point its own picker at a fresh root folder -- so a whole
// project manager's folder of jobs can now genuinely be added and browsed
// from "My projects", which is exactly the real-world shape this feature
// was built for. New regression test run_my_projects_root_folder.js builds
// a genuine three-level-deep detached root/project/level structure, adds
// the ROOT folder via "+ Add a project", and drives all the way down to
// actually opening a real level's plan -- explicitly sanity-checked (revert
// the fix, confirm the test times out failing to find a real project list)
// to be a real guard, not just a passing test.)
// (v30: real bug fixed, reported by Andrew: "layering needs to go like
// this. 1, background, 2, images, 3, dimentions at the moment there is no
// way to get a dimension back to the front layer if an image covers it.
// selecting an image automatically brings it to the front." Root cause,
// part 1: the plain click-to-select code path called an unconditional
// bringSelectedToFront() on every ordinary tap -- for every object type,
// not just while dragging -- which spliced the tapped object to the very
// END of state.objects (the same array whose order IS the saved/exported
// z-order). Selecting an image this way permanently promoted it above
// every annotation on the plan, silently, on a plain tap, with no drag or
// explicit "Bring to front" involved -- and it served no real purpose:
// hit-testing already picks the topmost object regardless of array order,
// and selection handles render in their own always-on-top layer either
// way. Root cause, part 2: "Bring to front" (the deliberate escape hatch
// for the rarer image that legitimately needs to sit above the plan's
// annotations) only ever existed for image objects -- once used, whatever
// dimension/text/etc. it now covered had no equivalent action available to
// bring it back. Fixed by (1) removing the automatic reorder-on-select
// entirely, (2) broadening "Bring to front" to every real, unlocked object
// type so a covered dimension can be pulled back above an image, and (3)
// adding a symmetric "Send to back" for images specifically, which also
// works as a one-tap repair for a project file saved before this fix where
// an image may already be sitting above annotations. New regression test
// run_layering_select_bug.js simulates a genuine click-to-select via the
// real onPointerDown/onPointerUp handlers and confirms z-order is
// untouched, confirms the new popover rows exist and work, and was
// explicitly sanity-checked (temporarily reintroducing the old reorder,
// confirming the test correctly fails, then restoring the fix) to be a
// real guard.)
//
// (v31: five requests from Andrew in one message: "we need a back button
// on the menu. also when changing from one page to another, (rooms
// etc...) we need a third option to change without saving. another thing,
// when exiting / saving it needs to auto lock all dimensions etc. the
// viewer can have the choice to change all line colours across the
// project with a simple colour selector in the menu bar. the item by item
// menus in the viewer app are not required." The last two are Viewer-only
// and are documented in that app's own service-worker.js; this app picks
// up the first three (the Viewer shares this exact same source.html, so
// its cache-bust below covers them too).
//
// (1) New "Back" toolbar button, next to Switch project/level. Clarified
// with Andrew up front (three genuinely different readings were possible)
// that this means a plain one-step-back: from inside a room, straight to
// that level's own main plan (previously only reachable in two steps, via
// Rooms then its own "open main floor plan" row); from a level's own main
// plan, up to the project's level list (identical to what Switch
// project/level already does from there). Hidden whenever there's
// genuinely nowhere for it to go -- plain single-file mode, or a bare
// level folder opened directly with no known parent project and no room
// open either -- mirroring Switch project/level's own visibility rule
// exactly, since that's the function Back defers to in that case.
//
// (2) The existing "save before leaving?" dialog (shown whenever you
// navigate away from a level/room with unsaved edits) gains a third
// choice -- "Leave without saving" -- alongside Save & leave / Cancel, so
// a mistaken or unwanted edit doesn't have to be saved just to get out.
// A new three-way modal (leaveConfirmBackdrop/-Save/-Discard/-Cancel)
// replaces the old boolean confirm for this one flow only; every other
// confirm dialog in the app (Delete, "Add a room here", etc.) is
// untouched.
//
// (3) Leaving a level/room via Save & leave (or the new Back button, or
// Rooms, or Switch project/level) now auto-locks every object on the way
// out, reusing the existing one-way "Lock all" mechanism -- confirmed
// with Andrew this means only on an actual departure, NOT on an ordinary
// mid-work Save while staying put on the same level/room, so you can
// still keep editing normally between saves without everything locking
// under you.
//
// New regression test run_back_button.js covers the Back button (hidden
// when there's nowhere to go, one-step navigation from both a room and a
// level, and that it auto-saves through the same chokepoint as every
// other navigation route), explicitly sanity-checked via a temporary
// revert-and-restore cycle. The pre-existing 59-test suite was re-run in
// full afterward with zero regressions beyond a few of its own tests'
// assumptions needing updates for the new dialog IDs and the new
// auto-lock-on-leave behaviour (e.g. a marker an earlier test in the same
// file expected to still be unlocked, since it had by then been through a
// real leave itself).
//
// (v32: three real bugs/requests from Andrew, reported the same day v31
// shipped, across three messages. (1) "taking photos on the app no longer
// inserts the image, it goes back the the home page instead." Investigated
// first per his own explicit "don't action, investigate" instruction:
// found nothing wrong in the insert-photo pipeline itself, but did find
// that boot() always lands on the bare top project list with nothing
// remembered -- so if the OS reclaims this app's tab/process while the
// phone's own camera app is in the foreground (a known Android behaviour
// under memory pressure), coming back looks exactly like a silent reboot.
// Added a "resume where I was" pointer (persistLastActiveWorkPointer/
// tryRestoreLastActiveWork), persisted the same way projectsRootHandle
// already is, that steps a fresh boot straight back down into whatever
// project/level/room was last open via the same openProjectFromHandle/
// openLevel/openRoom a person tapping their own way down would use. This
// can't recover a photo whose capture never made it back to the app at all
// -- nothing in JavaScript can stop the OS reclaiming a tab -- but it does
// mean anything already autosaved up to that point isn't ALSO buried
// behind having to renavigate there by hand. Andrew's own direct follow-up
// the same day confirmed the mechanism outright: Android/Chrome told him
// the tab reloaded due to low memory. On top of the boot-restore mitigation
// above, "Open" and "Insert image" now also flush whatever's currently
// drawn to disk (autosaveLevelPlanIfActive()) the instant BEFORE handing
// off to the OS's own file/camera picker, not only after a photo
// successfully comes back -- so the worst a mid-capture discard can now
// cost is the one photo that was in flight, never any earlier annotation
// work already on the same plan.
//
// (2) "also the viewer now lost the option to select rooms from the dot
// selector, maybe because its locked" -- a real regression from v31's own
// popover fix, on this app's shared source.html but only visible in the
// Viewer build; documented in full in that app's own service-worker.js.
//
// (3) "add in a multi page selector (when inserting a multi page pdf
// file, i want to be able to select multiple pages and they all get
// inserted into the canvas, even better if they can be auto resized and
// collated)." "Insert image" on a multi-page PDF now shows the same
// thumbnail picker in a new multi-select mode (Select all / per-page
// toggle badges numbered in true ascending page order regardless of click
// order / "Insert N pages") instead of forcing one page at a time. Every
// selected page is rendered (sequentially, same peak-memory reasoning as
// the picker's own thumbnails), auto-resized to fit a shared grid-cell
// bounding box while keeping its own true aspect ratio (never upscaled
// past its native size), and laid out as one roughly-square collated grid
// centered on screen -- all landing as ONE single Undo step, same as any
// other one deliberate action here. The "Open" (replace-plan) flow is
// completely unaffected -- still single-select, one page number back.
//
// New regression tests: run_viewer_room_marker_popover.js (fix 1's own
// test lives in the Viewer's service-worker.js, since that's the only
// build it's visible in -- but the source.html fix and this test are
// shared), run_pdf_multi_insert_collate.js, run_resume_on_boot.js (using a
// small in-memory fake IndexedDB for this one specifically -- this
// harness's fake directory/file handles aren't structured-cloneable, so a
// real idbSet() storing one silently fails exactly like it would for any
// other non-cloneable value, which would otherwise make the resume pointer
// unobservable in tests even though it works correctly for real), and
// run_flush_before_picker.js (the pre-picker flush, driven through the
// real "Open"/"Insert image" toolbar buttons without ever completing the
// file input's own change event, since there's no real file to pick in a
// headless test). Each sanity-checked via a temporary revert-and-restore
// cycle. The full pre-existing test suite was re-run afterward with zero
// regressions.
var CACHE_NAME = "utzline-sitemeasure-cache-v36";
var ICON_VERSION = CACHE_NAME.replace("utzline-sitemeasure-cache-", "");

var PRECACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.json?v=" + ICON_VERSION,
  "./jspdf.umd.min.js",
  "./svg2pdf.umd.min.js",
  "./pdf.min.js",
  "./pdf.worker.min.js",
  "./sans.woff2",
  "./mono.woff2",
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
