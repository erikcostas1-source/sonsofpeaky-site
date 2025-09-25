/**
 * Service Worker para Push Notifications
 * Gerador de Rolês - Background notifications e cache
 */

const CACHE_NAME = 'gerador-roles-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/database.js',
    '/auth.js',
    '/notifications.js',
    '/assets/img/SOP_LOGO_PRINCIPAL.svg',
    '/assets/img/sopwatermark.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache aberto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
    );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
    console.log('Push notification recebida:', event);
    
    let notificationData = {
        title: 'Gerador de Rolês',
        body: 'Você tem uma nova notificação',
        icon: '/assets/img/SOP_LOGO_PRINCIPAL.svg',
        badge: '/assets/img/sopwatermark.png',
        tag: 'default',
        data: {},
        actions: []
    };

    if (event.data) {
        try {
            const payload = event.data.json();
            notificationData = { ...notificationData, ...payload };
        } catch (error) {
            console.error('Erro ao processar payload da notificação:', error);
        }
    }

    // Add default actions based on notification type
    if (notificationData.type === 'generationComplete') {
        notificationData.actions = [
            {
                action: 'view',
                title: 'Ver Roteiro',
                icon: '/assets/img/SOP_LOGO_PRINCIPAL.svg'
            },
            {
                action: 'dismiss',
                title: 'Dispensar'
            }
        ];
    } else if (notificationData.type === 'limitReached') {
        notificationData.actions = [
            {
                action: 'upgrade',
                title: 'Fazer Upgrade',
                icon: '/assets/img/SOP_LOGO_PRINCIPAL.svg'
            },
            {
                action: 'dismiss',
                title: 'Fechar'
            }
        ];
    }

    const promiseChain = self.registration.showNotification(
        notificationData.title,
        notificationData
    );

    event.waitUntil(promiseChain);
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('Notificação clicada:', event.notification);
    
    event.notification.close();

    const notificationData = event.notification.data || {};
    const action = event.action;

    let urlToOpen = '/';

    // Handle different actions
    switch (action) {
        case 'view':
            if (notificationData.routeId) {
                urlToOpen = `/route.html?id=${notificationData.routeId}`;
            } else {
                urlToOpen = '/index.html';
            }
            break;
        case 'upgrade':
            urlToOpen = '/payment.html';
            break;
        case 'dismiss':
            return; // Just close, don't open anything
        default:
            // Default click (not on action button)
            if (notificationData.url) {
                urlToOpen = notificationData.url;
            } else if (event.notification.tag === 'generationComplete') {
                urlToOpen = '/index.html';
            } else if (event.notification.tag === 'limitReached') {
                urlToOpen = '/payment.html';
            }
    }

    // Open or focus the app
    const promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then((windowClients) => {
        // Check if app is already open
        let matchingClient = null;

        for (let i = 0; i < windowClients.length; i++) {
            const windowClient = windowClients[i];
            if (windowClient.url.includes(self.location.origin)) {
                matchingClient = windowClient;
                break;
            }
        }

        if (matchingClient) {
            // App is already open, just focus and navigate
            return matchingClient.focus().then(() => {
                // Send message to client to handle navigation
                matchingClient.postMessage({
                    type: 'notification-click',
                    url: urlToOpen,
                    notification: {
                        title: event.notification.title,
                        body: event.notification.body,
                        data: notificationData,
                        action: action
                    }
                });
            });
        } else {
            // App is not open, open new window
            return clients.openWindow(urlToOpen);
        }
    });

    event.waitUntil(promiseChain);
});

// Background sync for offline notifications
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync-notifications') {
        console.log('Background sync executado para notificações');
        event.waitUntil(syncNotifications());
    }
});

// Sync pending notifications when back online
async function syncNotifications() {
    try {
        // Get pending notifications from IndexedDB or send to main app
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'sync-notifications'
            });
        });
    } catch (error) {
        console.error('Erro ao sincronizar notificações:', error);
    }
}

// Handle messages from main application
self.addEventListener('message', (event) => {
    console.log('Service Worker recebeu mensagem:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker ativado');
    
    const cacheWhitelist = [CACHE_NAME];
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Claim all clients
            return self.clients.claim();
        })
    );
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'content-sync') {
        event.waitUntil(
            syncContent()
        );
    }
});

async function syncContent() {
    try {
        // Sync user data, notifications, etc.
        console.log('Periodic sync executado');
    } catch (error) {
        console.error('Erro no sync periódico:', error);
    }
}

// Handle app updates
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CHECK_UPDATE') {
        event.ports[0].postMessage({
            hasUpdate: false // Implement update checking logic
        });
    }
});