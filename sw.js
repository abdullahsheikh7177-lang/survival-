// This is the "Offline page" service worker

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "pwabuilder-page";

// TODO: replace the following with the correct offline fallback page i.e.: const offlineFallbackPage = "offline.html";
const offlineFallbackPage = "index.html";

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.add(offlineFallbackPage))
  );
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

self.addEventListener('fetch', (event) => {


const url = new URL(event.request.url);

if (url.pathname === '/share-target') {
  event.respondWith((async () => {
    const title = url.searchParams.get('title') || '';
    const text = url.searchParams.get('text') || '';
    const sharedUrl = url.searchParams.get('url') || '';
    
    // ডাটা নিয়ে সোজা index.html পেজে রিডাইরেক্ট করা
    const redirectUrl = `/?shared_title=${encodeURIComponent(title)}&shared_text=${encodeURIComponent(text)}&shared_url=${encodeURIComponent(sharedUrl)}`;
    return Response.redirect(redirectUrl, 303);
  })());
  return; // নিচের কোডে যাওয়া বন্ধ করবে
}

  
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse;

        if (preloadResp) {
          return preloadResp;
        }

        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {

        const cache = await caches.open(CACHE);
        const cachedResp = await cache.match(offlineFallbackPage);
        return cachedResp;
      }
    })());
  }
});


self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  
  const title = data.title || 'তথ্য সেবা';
  const options = {
    body: data.body || 'নতুন আপডেট এসেছে!',
    // এখানে sender-এর ছবিটি আইকন হিসেবে সেট হবে, না থাকলে ডিফল্ট আইকন
    icon: data.icon || './icon-192.png', 
    badge: './icon-192.png', // ফোনের স্ট্যাটাস বারে ছোট আইকন
    data: { url: data.url || '/' },
    vibrate: [200, 100, 200, 100, 200] // নোটিফিকেশন আসলে ভাইব্রেট করবে (ব্রাউজার সাপোর্ট করলে)
  };
  
  event.waitUntil(self.registration.showNotification(title, options));
});
