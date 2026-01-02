// This Service Worker is required to make the app "installable" on Android.
// It intercepts network requests to allow for offline capabilities in the future.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Simple pass-through strategy. 
  // In a production build, you would cache files here for offline support.
  event.respondWith(fetch(event.request));
});