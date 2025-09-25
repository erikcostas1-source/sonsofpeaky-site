// Service Worker para PWA do Gerador de Rolês
const CACHE_NAME = 'gerador-roles-v1.0.6';
const urlsToCache = [
  './',
  './gerador-index.html',
  './styles.css', // Correct path as used in the HTML
  './gerador.js',
  './manifest.json',
  './config.js',
  './destinos.js',
  './assets/img/moto-icon-192.png', // Correct path relative to this scope
  './assets/img/moto-icon-512.png',
  './assets/img/hero-banner.jpg',
  './assets/img/loading-spinner.png'
];

// Install
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activate');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch
self.addEventListener('fetch', event => {
  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request).then(fetchResponse => {
          // Cache new responses
          if (fetchResponse.status === 200) {
            const responseClone = fetchResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return fetchResponse;
        });
      })
      .catch(() => {
        // Fallback for offline
        if (event.request.destination === 'document') {
          return caches.match('/gerador-roles/index.html');
        }
      })
  );
});

// Background sync for form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync-form') {
    console.log('🔄 Service Worker: Background sync');
    event.waitUntil(
      // Handle offline form submissions
      handleBackgroundSync()
    );
  }
});

async function handleBackgroundSync() {
  try {
    // Get pending requests from IndexedDB
    const pendingRequests = await getPendingRequests();
    
    for (const request of pendingRequests) {
      try {
        await fetch(request.url, request.options);
        await removePendingRequest(request.id);
        console.log('✅ Service Worker: Sync completed for request', request.id);
      } catch (error) {
        console.error('❌ Service Worker: Sync failed for request', request.id, error);
      }
    }
  } catch (error) {
    console.error('❌ Service Worker: Background sync error', error);
  }
}

// Push notifications
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nova atualização disponível!',
      icon: './assets/img/moto-icon-192.png',
      badge: './assets/img/moto-icon-192.png',
      vibrate: [100, 50, 100],
      data: data.data || {},
      actions: [
        {
          action: 'open',
          title: 'Abrir',
          icon: './assets/img/moto-icon-96.png'
        },
        {
          action: 'close',
          title: 'Fechar'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Gerador de Rolês', options)
    );
  }
});

// Notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('./')
    );
  }
});

// Message handling
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Helper functions for IndexedDB operations
async function getPendingRequests() {
  // Implementar quando necessário
  return [];
}

async function removePendingRequest(id) {
  // Implementar quando necessário
  return true;
}

console.log('✅ Service Worker: Gerador de Rolês loaded');