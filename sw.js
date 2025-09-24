/**
 * SONS OF PEAKY - SERVICE WORKER
 * Cache estratégico, otimização de performance e funcionalidades offline
 */

const CACHE_NAME = 'sop-v1.0.0';
const STATIC_CACHE = 'sop-static-v1.0.0';
const DYNAMIC_CACHE = 'sop-dynamic-v1.0.0';
const API_CACHE = 'sop-api-v1.0.0';

// Recursos críticos para cache imediato
const CRITICAL_RESOURCES = [
    '/',
    '/index-new.html',
    '/assets/css/styles-new.css',
    '/assets/js/app.js',
    '/assets/js/ai-assistant.js',
    '/assets/img/SOP_LOGO_PRINCIPAL.svg',
    '/assets/img/SONSOFPEAKY_TRANSPARENTE_BRANCO.png',
    '/manifest.json'
];

// Recursos estáticos para cache on-demand
const STATIC_RESOURCES = [
    '/assets/css/',
    '/assets/js/',
    '/assets/img/',
    '/assets/icons/',
    'https://fonts.googleapis.com/',
    'https://fonts.gstatic.com/',
    'https://cdn.tailwindcss.com/'
];

// APIs para cache com estratégia especial
const API_ENDPOINTS = [
    'https://generativelanguage.googleapis.com/'
];

// Estratégias de cache
const CACHE_STRATEGIES = {
    CACHE_FIRST: 'cache-first',
    NETWORK_FIRST: 'network-first',
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
    NETWORK_ONLY: 'network-only',
    CACHE_ONLY: 'cache-only'
};

// Configurações de performance
const CONFIG = {
    maxCacheSize: 50, // Máximo de arquivos no cache dinâmico
    maxCacheAge: 30 * 24 * 60 * 60 * 1000, // 30 dias em ms
    apiCacheTime: 5 * 60 * 1000, // 5 minutos para APIs
    offlineMessage: 'Você está offline. Algumas funcionalidades podem estar limitadas.'
};

// === EVENTOS DO SERVICE WORKER ===

// Instalação
self.addEventListener('install', event => {
    console.log('🔧 Service Worker: Instalando...');
    
    event.waitUntil(
        Promise.all([
            cacheInstallResources(),
            self.skipWaiting()
        ])
    );
});

// Ativação
self.addEventListener('activate', event => {
    console.log('✅ Service Worker: Ativando...');
    
    event.waitUntil(
        Promise.all([
            cleanOldCaches(),
            self.clients.claim()
        ])
    );
});

// Interceptação de requisições
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Ignorar requisições não-GET
    if (request.method !== 'GET') {
        return;
    }
    
    // Determinar estratégia baseada no tipo de recurso
    const strategy = determineStrategy(url, request);
    
    event.respondWith(
        handleRequest(request, strategy)
    );
});

// Sincronização em background
self.addEventListener('sync', event => {
    console.log('🔄 Service Worker: Sincronização background', event.tag);
    
    if (event.tag === 'sync-offline-data') {
        event.waitUntil(syncOfflineData());
    }
});

// Notificações push (futuro)
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        showNotification(data);
    }
});

// === FUNÇÕES DE CACHE ===

async function cacheInstallResources() {
    try {
        const cache = await caches.open(STATIC_CACHE);
        
        // Cache recursos críticos
        await cache.addAll(CRITICAL_RESOURCES);
        
        console.log('📦 Recursos críticos cacheados');
        
        // Pre-cache fontes importantes
        await preCacheFonts(cache);
        
        return true;
    } catch (error) {
        console.error('❌ Erro ao cachear recursos na instalação:', error);
        return false;
    }
}

async function preCacheFonts(cache) {
    const fontUrls = [
        'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
        'https://fonts.googleapis.com/css2?family=Pirata+One&display=swap'
    ];
    
    try {
        await cache.addAll(fontUrls);
        console.log('🔤 Fontes cacheadas');
    } catch (error) {
        console.warn('⚠️ Erro ao cachear fontes:', error);
    }
}

async function cleanOldCaches() {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
        name.startsWith('sop-') && name !== CACHE_NAME && 
        name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== API_CACHE
    );
    
    await Promise.all(
        oldCaches.map(cacheName => {
            console.log('🗑️ Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
        })
    );
}

// === ESTRATÉGIAS DE REQUISIÇÕES ===

function determineStrategy(url, request) {
    const pathname = url.pathname;
    const hostname = url.hostname;
    
    // Recursos críticos: Cache First
    if (CRITICAL_RESOURCES.some(resource => pathname.includes(resource))) {
        return CACHE_STRATEGIES.CACHE_FIRST;
    }
    
    // APIs: Network First com cache de backup
    if (API_ENDPOINTS.some(endpoint => url.href.includes(endpoint))) {
        return CACHE_STRATEGIES.NETWORK_FIRST;
    }
    
    // Imagens: Stale While Revalidate
    if (request.destination === 'image') {
        return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
    }
    
    // CSS e JS: Stale While Revalidate
    if (pathname.includes('.css') || pathname.includes('.js')) {
        return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
    }
    
    // Fontes externas: Cache First
    if (hostname.includes('googleapis.com') || hostname.includes('gstatic.com')) {
        return CACHE_STRATEGIES.CACHE_FIRST;
    }
    
    // CDNs: Cache First
    if (hostname.includes('cdn.') || hostname.includes('cdnjs.')) {
        return CACHE_STRATEGIES.CACHE_FIRST;
    }
    
    // HTML: Network First
    if (request.destination === 'document') {
        return CACHE_STRATEGIES.NETWORK_FIRST;
    }
    
    // Default: Network First
    return CACHE_STRATEGIES.NETWORK_FIRST;
}

async function handleRequest(request, strategy) {
    switch (strategy) {
        case CACHE_STRATEGIES.CACHE_FIRST:
            return cacheFirst(request);
            
        case CACHE_STRATEGIES.NETWORK_FIRST:
            return networkFirst(request);
            
        case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
            return staleWhileRevalidate(request);
            
        case CACHE_STRATEGIES.NETWORK_ONLY:
            return fetch(request);
            
        case CACHE_STRATEGIES.CACHE_ONLY:
            return caches.match(request);
            
        default:
            return networkFirst(request);
    }
}

// Cache First: Tenta cache, depois rede
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.warn('❌ Cache First falhou:', error);
        return createOfflineResponse(request);
    }
}

// Network First: Tenta rede, depois cache
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cachear resposta dinâmica
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
            
            // Limpar cache antigo se necessário
            await limitCacheSize(DYNAMIC_CACHE, CONFIG.maxCacheSize);
        }
        
        return networkResponse;
        
    } catch (error) {
        console.warn('🌐 Rede indisponível, tentando cache:', request.url);
        
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        return createOfflineResponse(request);
    }
}

// Stale While Revalidate: Retorna cache e atualiza em background
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    // Buscar versão atualizada em background
    const fetchPromise = fetch(request).then(response => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => {
        // Falha na rede é normal nesta estratégia
    });
    
    // Retornar cache imediatamente se disponível
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // Se não há cache, aguardar rede
    try {
        return await fetchPromise;
    } catch (error) {
        return createOfflineResponse(request);
    }
}

// === UTILITÁRIOS ===

async function limitCacheSize(cacheName, maxItems) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > maxItems) {
        const deletePromises = keys
            .slice(0, keys.length - maxItems)
            .map(key => cache.delete(key));
        
        await Promise.all(deletePromises);
    }
}

function createOfflineResponse(request) {
    const url = new URL(request.url);
    const isAPI = API_ENDPOINTS.some(endpoint => url.href.includes(endpoint));
    
    if (isAPI) {
        return new Response(
            JSON.stringify({
                error: 'Offline',
                message: 'Esta funcionalidade requer conexão com a internet.',
                offline: true
            }),
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            }
        );
    }
    
    if (request.destination === 'document') {
        return new Response(
            createOfflinePage(),
            {
                status: 200,
                statusText: 'OK',
                headers: {
                    'Content-Type': 'text/html',
                    'Cache-Control': 'no-cache'
                }
            }
        );
    }
    
    if (request.destination === 'image') {
        return new Response(
            createOfflineImage(),
            {
                status: 200,
                statusText: 'OK',
                headers: {
                    'Content-Type': 'image/svg+xml',
                    'Cache-Control': 'no-cache'
                }
            }
        );
    }
    
    return new Response('Recurso indisponível offline', {
        status: 503,
        statusText: 'Service Unavailable'
    });
}

function createOfflinePage() {
    return `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Offline - Sons of Peaky</title>
            <style>
                body {
                    font-family: system-ui, sans-serif;
                    background: #0d0d0d;
                    color: #e5e7eb;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                }
                .offline-container {
                    text-align: center;
                    max-width: 400px;
                    padding: 2rem;
                }
                .offline-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }
                h1 {
                    color: #c9a14a;
                    margin-bottom: 1rem;
                }
                .retry-btn {
                    background: #fb923c;
                    color: #0d0d0d;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 9999px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-top: 1rem;
                }
                .retry-btn:hover {
                    background: #f59e0b;
                }
            </style>
        </head>
        <body>
            <div class="offline-container">
                <div class="offline-icon">📴</div>
                <h1>Você está offline</h1>
                <p>Não foi possível carregar esta página. Verifique sua conexão com a internet.</p>
                <button class="retry-btn" onclick="window.location.reload()">
                    🔄 Tentar Novamente
                </button>
            </div>
        </body>
        </html>
    `;
}

function createOfflineImage() {
    return `
        <svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
            <rect width="300" height="200" fill="#1a1a1a"/>
            <rect x="10" y="10" width="280" height="180" fill="none" stroke="#c9a14a" stroke-width="2" stroke-dasharray="5,5"/>
            <text x="150" y="100" text-anchor="middle" fill="#c9a14a" font-family="system-ui" font-size="16">📷</text>
            <text x="150" y="125" text-anchor="middle" fill="#9ca3af" font-family="system-ui" font-size="12">Imagem indisponível offline</text>
        </svg>
    `;
}

async function syncOfflineData() {
    try {
        console.log('🔄 Sincronizando dados offline...');
        
        // Sincronizar dados do localStorage com servidor (futuro)
        const offlineData = getOfflineData();
        
        if (offlineData.length > 0) {
            // Implementar sincronização real aqui
            console.log('📤 Sincronizando', offlineData.length, 'itens');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Erro na sincronização:', error);
        return false;
    }
}

function getOfflineData() {
    // Obter dados salvos offline para sincronização
    const keys = ['sop_ai_conversation', 'sop_user_context', 'sop_ai_events'];
    const data = [];
    
    keys.forEach(key => {
        try {
            const item = localStorage.getItem(key);
            if (item) {
                data.push({ key, data: JSON.parse(item) });
            }
        } catch (error) {
            console.warn('Erro ao ler dados offline:', key, error);
        }
    });
    
    return data;
}

function showNotification(data) {
    const { title, body, icon, tag } = data;
    
    const options = {
        body: body || 'Nova notificação do Sons of Peaky',
        icon: icon || '/assets/img/SONSOFPEAKY_TRANSPARENTE_BRANCO.png',
        badge: '/assets/icons/favicon-32x32.png',
        tag: tag || 'sop-notification',
        vibrate: [200, 100, 200],
        actions: [
            {
                action: 'open',
                title: 'Abrir'
            },
            {
                action: 'close',
                title: 'Fechar'
            }
        ]
    };
    
    self.registration.showNotification(title || 'Sons of Peaky', options);
}

// === MONITORAMENTO DE PERFORMANCE ===

// Monitorar tempos de cache
const cachePerformance = {
    hits: 0,
    misses: 0,
    totalTime: 0,
    
    recordHit(time) {
        this.hits++;
        this.totalTime += time;
    },
    
    recordMiss(time) {
        this.misses++;
        this.totalTime += time;
    },
    
    getStats() {
        const total = this.hits + this.misses;
        return {
            hitRate: total > 0 ? (this.hits / total * 100).toFixed(2) + '%' : '0%',
            averageTime: total > 0 ? (this.totalTime / total).toFixed(2) + 'ms' : '0ms',
            totalRequests: total
        };
    }
};

// Log de performance a cada 100 requisições
let requestCount = 0;
setInterval(() => {
    if (requestCount > 0 && requestCount % 100 === 0) {
        console.log('📊 Cache Performance:', cachePerformance.getStats());
    }
}, 5000);

console.log('🚀 Service Worker SOP v1.0.0 carregado com sucesso!');