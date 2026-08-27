// Notepad-XR Production Service Worker with Full PWA & PWABuilder Capabilities
const CACHE_NAME = 'notepad-xr-cache-v2';
const OFFLINE_PAGE = '/offline.html';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  OFFLINE_PAGE,
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
  '/Icon.ico',
  '/screenshot-wide.jpg',
  '/screenshot-narrow.jpg',
  '/widgets/quick-note.json',
  '/widgets/quick-note-data.json'
];

// 1. Install Event: Pre-cache core app shell & offline page
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Clean up stale caches & claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Skip Waiting Message Listener (PWABuilder standard)
self.addEventListener('message', (event) => {
  if (event.data && (event.data.type === 'SKIP_WAITING' || event.data === 'skipWaiting')) {
    self.skipWaiting();
  }
});

// 4. Fetch Event: Intelligent Cache/Network strategy + Share Target POST Handling
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Handle Share Target POST requests
  if (request.method === 'POST' && url.searchParams.get('action') === 'share-target') {
    event.respondWith((async () => {
      try {
        const formData = await request.formData();
        const title = formData.get('title') || '';
        const text = formData.get('text') || '';
        const shareUrl = formData.get('url') || '';
        const files = formData.getAll('files');

        let fileTextContent = '';
        if (files && files.length > 0) {
          const firstFile = files[0];
          if (firstFile instanceof File) {
            fileTextContent = await firstFile.text();
          }
        }

        // Store shared payload in a temporary cache entry
        const sharedPayload = {
          title: title.toString(),
          text: (text || fileTextContent).toString(),
          url: shareUrl.toString(),
          timestamp: Date.now()
        };

        const cache = await caches.open(CACHE_NAME);
        await cache.put(
          new Request('/_shared_pwa_content'),
          new Response(JSON.stringify(sharedPayload), {
            headers: { 'Content-Type': 'application/json' }
          })
        );

        // Redirect user to the app to open the shared note
        return Response.redirect('/?action=shared-content', 303);
      } catch (err) {
        console.error('Error processing share target POST:', err);
        return Response.redirect('/?action=new', 303);
      }
    })());
    return;
  }

  // Only handle GET requests for standard caching
  if (request.method !== 'GET') return;

  // Navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        // Try network first for up-to-date app
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, responseClone);
        }
        return networkResponse;
      } catch (err) {
        // If offline, serve cached index.html or fallback offline page
        const cache = await caches.open(CACHE_NAME);
        const cachedIndex = await cache.match('/index.html');
        if (cachedIndex) return cachedIndex;

        const cachedOffline = await cache.match(OFFLINE_PAGE);
        if (cachedOffline) return cachedOffline;

        return new Response('Offline - Notepad-XR is available once loaded.', {
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    })());
    return;
  }

  // Static Assets & Scripts (Stale-While-Revalidate)
  event.respondWith((async () => {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Revalidate in background
      fetch(request).then(async (networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse);
        }
      }).catch(() => {});
      return cachedResponse;
    }

    try {
      const networkResponse = await fetch(request);
      if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
        const responseToCache = networkResponse.clone();
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, responseToCache);
      }
      return networkResponse;
    } catch (error) {
      // Fail gracefully for images or optional resources
      return cachedResponse || Response.error();
    }
  })());
});

// 5. Windows 11 Widgets API Integration
self.addEventListener('widgetinstall', (event) => {
  event.waitUntil(renderWidget(event.widget));
});

self.addEventListener('widgetuninstall', (event) => {
  console.log('Widget uninstalled:', event.widget);
});

self.addEventListener('widgetresume', (event) => {
  event.waitUntil(renderWidget(event.widget));
});

self.addEventListener('widgetclick', (event) => {
  if (event.action === 'new_note') {
    event.waitUntil(
      self.clients.openWindow('/?action=new_note')
    );
  } else {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

async function renderWidget(widget) {
  try {
    const template = await (await fetch('/widgets/quick-note.json')).text();
    const data = await (await fetch('/widgets/quick-note-data.json')).text();
    if (self.widgets && self.widgets.updateByTag) {
      await self.widgets.updateByTag(widget.definition.tag, { template, data });
    }
  } catch (e) {
    console.log('Widget render error:', e);
  }
}
