const CACHE_NAME = "aircraft-table-v1";
const ASSETS = [
  "/", // Cache the root HTML file
  "/index.html", // Cache the main HTML file
  "/styles.css", // Cache your CSS file
  "/script.js", // Cache your JavaScript file
  "/SFPRODISPLAY-REGULAR.TTF" // Cache your font file
];

// Install the Service Worker and cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Serve cached assets when offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});