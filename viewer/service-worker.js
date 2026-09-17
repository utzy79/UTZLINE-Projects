// UTZLINE Viewer offline service worker.
//
// This is the SEPARATE, independently-installable read-only companion to
// UTZLINE Site Measure -- own manifest, own icon, own taskbar/Start-menu
// entry, own cache namespace ("utzline-viewer-cache-*", never sharing a
// name with the editor's "utzline-sitemeasure-cache-*" even though both
// can be installed side by side on the same machine). It shares the exact
// same underlying app (source.html) as the editor -- see VIEW_ONLY_MODE's
// own comment there -- via a mode flag read from the URL at load, which
// this app's own manifest.json start_url ("./index.html?viewer=1") always
// supplies. See redline-projects-pwa/service-worker.js for the full
// version history of the shared app itself; this file's own history only
// covers this separate packaging.
//
// Same cache-first app shell strategy as the editor: a small, fixed set of
// local files, no CDN calls once installed. Bump CACHE_NAME whenever
// index.html or any vendored asset changes (i.e. every time this is
// rebuilt from a new source.html), so installed copies pick up the update
// instead of serving stale files forever.
//
// (v20: first release -- packages the v20 read-only viewer mode (see
// source.html's VIEW_ONLY_MODE) as its own standalone installable app.)
// (v20a: HOTFIX -- the first release only switched read-only mode on via a
// "?viewer=1" URL query string, which the bare app URL (and any bookmark or
// shared link without that query string) doesn't carry, so opening this
// app's own URL directly loaded the full EDITABLE app -- same toolbar, same
// orange branding as the main editor -- with no read-only lock at all.
// build.py now hard-codes VIEW_ONLY_MODE = true in this bundle's own
// index.html, so it's read-only no matter how the URL is reached. Bumping
// the cache name here so anyone who already loaded/cached the broken v20
// build picks up this fix instead of continuing to serve it from cache.)
// (v21: new "jump to any room" dropdown in the toolbar -- grouped by level,
// lets you jump straight to any level's plan or any room in the whole open
// project from anywhere, without stepping back out through Switch level/
// Rooms first. Also re-skins the in-app accent color and logo to blue, to
// match this app's own icon, instead of the editor's orange.)
// (v22: CRITICAL SAFETY FIX -- long-press/right-click "Delete" on a
// project/level/room row used to call the exact same real, recursive
// removeEntry() the editor uses, with no read-only check at all, so this
// app could actually destroy real project files despite being the
// "read-only" Viewer (reported by Andrew, 2026-09-17). Replaced with a
// purely local, non-destructive "hide from my list" -- reversible via a
// new "Show hidden" toggle -- that never touches the real folder. Also
// hides "+ New Project/Level/Room" (no legitimate create action exists in
// read-only mode) and fixes the project-gate's own title to say "UTZLINE
// Viewer" like the header already did.)
// (v23: shares in the two fixes shipped in the editor's own v23 the same
// day -- the "jump to any room" dropdown was already here since v21 and is
// unchanged; the real change for THIS app is the multi-room save fix
// (saveActiveWorkBeforeLeaving/clearActiveWorkInMemory in source.html).
// It's a no-op here in practice -- every write it could trigger is still
// blocked by VIEW_ONLY_MODE exactly like every other mutation already was
// -- but it's the same shared source.html as the editor, so this bundle
// picks it up too. Bumping the cache name to match the editor's release.)
// (v24: shares in the editor's own v24 "save before leaving?" confirm the
// same way -- saveActiveWorkBeforeLeaving() checks VIEW_ONLY_MODE before
// anything else and bails out immediately in that case, so this is a pure
// no-op here: the Viewer already never wrote anything on navigation, and it
// still doesn't; nothing new is ever shown to a Viewer user. Bumping the
// cache name to match the editor's release, same as v23.)
// (v25: shares in the editor's own v25 toolbar layout fix -- the toolbar's
// two rows (file actions / drawing tools) are now permanently fixed and
// independently scrollable instead of one shared flex-wrap row, stopping
// the "jumping" reflow that could happen as buttons showed/hid. Same
// shared source.html as the editor, so this bundle picks it up too --
// bumping the cache name to match.)
// (v26: shares in the editor's own v26 changes. The new "export all room/
// level PDFs" batch actions are a no-op here -- both new buttons are hidden
// in Viewer mode (they write into project folders, same as every other
// create/export action already hidden there), same as Save itself always
// has been. The "Share current view" title-block overflow fix (the logo/
// timestamp block could spill off the left edge of a tightly-zoomed crop)
// is real and DOES apply here too -- Share/print is fully live in the
// Viewer, and addExportOverlays is the exact same shared function. Same
// shared source.html as the editor, so this bundle picks up both --
// bumping the cache name to match.)
var CACHE_NAME = "utzline-viewer-cache-v26";
var ICON_VERSION = CACHE_NAME.replace("utzline-viewer-cache-", "");

var PRECACHE_URLS = [
  "./",
  "./index.html",
  "./index.html?viewer=1",
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
