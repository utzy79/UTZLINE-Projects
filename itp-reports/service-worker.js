// UTZLINE ITP offline service worker.
//
// This is a SEPARATE, independently-installable app in the same family as
// UTZLINE Site Measure (the editor) and UTZLINE Viewer (the read-only
// browser) -- its own manifest, own icon, own taskbar/Start-menu entry, own
// cache namespace ("utzline-itp-cache-*", never sharing a name with either
// of the other two even though all three can be installed side by side on
// the same machine). Unlike the Viewer, this is NOT built from the same
// source.html as the editor -- it's a standalone, purpose-built app (a
// checklist form, not a plan-drawing canvas) that reads the SAME Projects
// folder structure (project/level/room, the same reserved saves/pdfs/backup
// convention) and writes its own project-wide "itp" folder alongside a
// project's level folders. See index.html's own top-of-file comment for the
// full data-format rationale.
//
// Same cache-first app shell strategy as the other two apps: a small, fixed
// set of local files, no CDN calls once installed. Bump CACHE_NAME whenever
// index.html or any vendored asset changes, so installed copies pick up the
// update instead of serving stale files forever.
//
// (v1: first release -- project/level/room browsing, a Joinery Items list
// per room, the 16-row install-quality checklist with per-role touch
// signatures, and PDF export into the project's own itp/<level>/<room>
// folder.)
//
// (v2, 2026-09-18: a Level Plan screen -- the level's own photo, panned/
// zoomed like the Viewer, with every joinery-item marker Site Measure
// places on it (one marker per joinery item, not per room) shown as a
// green tick/red cross for that item's own sign-off status; tapping one
// jumps straight into that item's checklist. A company-logo setting
// (device-wide, stored locally) prints top-right on exported PDFs, and
// UTZLINE ITP's own brand mark prints bottom-right on every page. The
// checklist's Back button now asks to save/discard/cancel when there's a
// real unsaved edit, same three-way dialog as the other two apps.)

var ICON_VERSION = "v2";
var CACHE_NAME = "utzline-itp-cache-v2";

var PRECACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.json?v=" + ICON_VERSION,
  "./jspdf.umd.min.js",
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
