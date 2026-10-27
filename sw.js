// The service worker: keeps a copy of the app on the device so it opens with
// no internet connection, for example from the Home Screen in Airplane Mode.
// The build fills in CACHE_NAME and PRECACHE_URLS and writes the result to
// sw.js (see vite.config.ts). The dev server doesn't use it.

const CACHE_NAME = "study-tracker-93f5c8e32be4";
const PRECACHE_URLS = [
  "./",
  "assets/index-B37tuGEh.js",
  "assets/leaflet-src-DVLh6X2T.js",
  "assets/index-BszPltbg.css",
  "assets/leaflet-vh-t_kPv.css",
  "assets/montserrat-cyrillic-ext-wght-normal-CO5hGrJv.woff2",
  "assets/montserrat-cyrillic-wght-normal-EAA9jha_.woff2",
  "assets/montserrat-latin-ext-wght-normal-BsZE-iaG.woff2",
  "assets/montserrat-latin-wght-normal-l_AIctKy.woff2",
  "assets/montserrat-vietnamese-wght-normal-k7S-YeeD.woff2",
  "assets/source-sans-3-cyrillic-ext-wght-normal-c-5QAGAI.woff2",
  "assets/source-sans-3-cyrillic-wght-normal-BMDVbyM7.woff2",
  "assets/source-sans-3-greek-ext-wght-normal-BXZfsJY4.woff2",
  "assets/source-sans-3-greek-wght-normal-Cc-u-6OI.woff2",
  "assets/source-sans-3-latin-ext-wght-normal-C8iNium2.woff2",
  "assets/source-sans-3-latin-wght-normal-Bo_j9asI.woff2",
  "assets/source-sans-3-vietnamese-wght-normal-BDs68eHQ.woff2",
  "favicon.svg",
  "manifest.webmanifest",
  "icons/app-icon.svg",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png"
];
const APP_PAGE = "./";

// Save every file of this version of the app, then take over right away.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

// Delete the copies saved by older versions.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (
    request.method !== "GET" ||
    new URL(request.url).origin !== self.location.origin
  ) {
    return;
  }

  if (request.mode === "navigate") {
    // The page itself: ask the network first so a new version shows up when
    // online, and fall back to the saved copy when offline.
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(APP_PAGE, copy));
          }
          return response;
        })
        .catch(() => caches.match(APP_PAGE, { ignoreVary: true })),
    );
    return;
  }

  // Scripts, styles, fonts, and icons: built file names change whenever their
  // contents do, so a saved copy is always current. Use it first. ignoreVary:
  // the page asks for scripts and styles with an Origin header that the saved
  // requests lack, and a server's "Vary: Origin" would otherwise hide the copy.
  event.respondWith(
    caches
      .match(request, { ignoreVary: true })
      .then((saved) => saved ?? fetch(request)),
  );
});
