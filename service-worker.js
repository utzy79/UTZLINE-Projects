// UTZLINE Projects offline service worker.
// This is a separate app/deployment forked from UTZLINE Site Measure
// (the original redline-pwa) at v40 of that app -- same plan/photo
// markup engine, plus a per-project folder system layered on top. Kept
// under its own cache namespace ("utzline-projects-cache-*", not
// "redline-cache-*") and its own versioning, starting fresh at v1, so
// nothing about this app's releases is tangled up with the original
// app's, which continues to be maintained completely independently.
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
var CACHE_NAME = "utzline-projects-cache-v1";
var ICON_VERSION = CACHE_NAME.replace("utzline-projects-cache-", "");

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
