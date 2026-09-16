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
var CACHE_NAME = "utzline-sitemeasure-cache-v18";
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
