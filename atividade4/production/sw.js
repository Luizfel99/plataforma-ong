/**
 * SERVICE WORKER - CACHE E PERFORMANCE PARA PRODUÇÃO
 * Implementa cache agressivo, offline-first, e otimizações de performance
 */

const CACHE_NAME = 'plataforma-ong-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';
const IMAGE_CACHE = 'images-v1.0.0';

// Arquivos essenciais para cache inicial
const CORE_FILES = [
    '/',
    '/index.html',
    '/assets/css/style.css',
    '/assets/js/site.js',
    '/assets/js/graficos.js',
    '/manifest.json'
];

// Arquivos estáticos para cache
const STATIC_FILES = [
    '/sobre.html',
    '/projetos.html',
    '/doacoes.html',
    '/voluntariado.html',
    '/transparencia.html',
    '/contato.html',
    '/blog.html',
    '/assets/css/style.css',
    '/assets/js/site.js',
    '/assets/js/graficos.js',
    '/assets/js/checkout.js'
];

// Configurações de cache
const CACHE_CONFIG = {
    // Cache por 1 ano para recursos estáticos
    STATIC_MAX_AGE: 365 * 24 * 60 * 60 * 1000,
    // Cache por 1 dia para conteúdo dinâmico
    DYNAMIC_MAX_AGE: 24 * 60 * 60 * 1000,
    // Cache por 1 semana para imagens
    IMAGE_MAX_AGE: 7 * 24 * 60 * 60 * 1000,
    // Máximo de entradas no cache dinâmico
    DYNAMIC_CACHE_LIMIT: 50,
    // Máximo de entradas no cache de imagens
    IMAGE_CACHE_LIMIT: 100
};

// Estratégias de cache
const CACHE_STRATEGIES = {
    'cache-first': ['css', 'js', 'woff', 'woff2', 'ttf', 'eot'],
    'network-first': ['html'],
    'stale-while-revalidate': ['json', 'xml'],
    'network-only': ['api'],
    'cache-only': []
};

/**
 * INSTALAÇÃO DO SERVICE WORKER
 */
self.addEventListener('install', event => {
    console.log('🔧 Service Worker instalando...');
    
    event.waitUntil(
        Promise.all([
            // Cache dos arquivos essenciais
            caches.open(STATIC_CACHE).then(cache => {
                console.log('📦 Fazendo cache dos arquivos essenciais');
                return cache.addAll(CORE_FILES);
            }),
            
            // Cache dos arquivos estáticos
            caches.open(STATIC_CACHE).then(cache => {
                console.log('📦 Fazendo cache dos arquivos estáticos');
                return Promise.allSettled(
                    STATIC_FILES.map(url => 
                        cache.add(url).catch(err => 
                            console.warn(`⚠️ Erro ao fazer cache de ${url}:`, err)
                        )
                    )
                );
            })
        ]).then(() => {
            console.log('✅ Service Worker instalado com sucesso');
            // Força a ativação imediata
            return self.skipWaiting();
        })
    );
});

/**
 * ATIVAÇÃO DO SERVICE WORKER
 */
self.addEventListener('activate', event => {
    console.log('🔄 Service Worker ativando...');
    
    event.waitUntil(
        Promise.all([
            // Limpar caches antigos
            cleanOldCaches(),
            
            // Tomar controle de todas as abas
            self.clients.claim()
        ]).then(() => {
            console.log('✅ Service Worker ativado e controlando todas as abas');
        })
    );
});

/**
 * INTERCEPTAÇÃO DE REQUISIÇÕES
 */
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Ignorar requisições não HTTP
    if (!request.url.startsWith('http')) return;
    
    // Ignorar requisições de browser extensions
    if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') return;
    
    // Determinar estratégia baseada no tipo de arquivo
    const fileExtension = getFileExtension(url.pathname);
    const strategy = getStrategy(fileExtension, url);
    
    event.respondWith(
        handleRequest(request, strategy)
    );
});

/**
 * ESTRATÉGIAS DE CACHE
 */

// Cache First - Para recursos estáticos
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
        console.error('❌ Erro na estratégia cache-first:', error);
        return await getOfflineFallback(request);
    }
}

// Network First - Para conteúdo dinâmico
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            // Limitar tamanho do cache dinâmico
            await limitCacheSize(cache, CACHE_CONFIG.DYNAMIC_CACHE_LIMIT);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.warn('⚠️ Rede falhou, tentando cache:', request.url);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        return await getOfflineFallback(request);
    }
}

// Stale While Revalidate - Para dados que podem ser atualizados em background
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    // Buscar nova versão em background
    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(error => {
        console.warn('⚠️ Erro ao revalidar:', request.url, error);
    });
    
    // Retornar cache imediatamente se disponível, senão aguardar rede
    return cachedResponse || fetchPromise;
}

// Network Only - Para APIs ou conteúdo que deve sempre ser fresco
async function networkOnly(request) {
    try {
        return await fetch(request);
    } catch (error) {
        console.error('❌ Erro na estratégia network-only:', error);
        throw error;
    }
}

// Cache Only - Para recursos que devem sempre vir do cache
async function cacheOnly(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    throw new Error('Recurso não encontrado no cache');
}

/**
 * FUNÇÕES AUXILIARES
 */

function getFileExtension(pathname) {
    const parts = pathname.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

function getStrategy(fileExtension, url) {
    // Verificar se é uma página HTML
    if (!fileExtension || fileExtension === 'html') {
        return 'network-first';
    }
    
    // Verificar se é uma API
    if (url.pathname.includes('/api/')) {
        return 'network-only';
    }
    
    // Verificar estratégias definidas
    for (const [strategy, extensions] of Object.entries(CACHE_STRATEGIES)) {
        if (extensions.includes(fileExtension)) {
            return strategy;
        }
    }
    
    // Estratégia padrão para imagens
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'avif'].includes(fileExtension)) {
        return 'cache-first';
    }
    
    // Estratégia padrão
    return 'stale-while-revalidate';
}

async function handleRequest(request, strategy) {
    switch (strategy) {
        case 'cache-first':
            return await cacheFirst(request);
        case 'network-first':
            return await networkFirst(request);
        case 'stale-while-revalidate':
            return await staleWhileRevalidate(request);
        case 'network-only':
            return await networkOnly(request);
        case 'cache-only':
            return await cacheOnly(request);
        default:
            return await staleWhileRevalidate(request);
    }
}

async function getOfflineFallback(request) {
    const url = new URL(request.url);
    
    // Fallback para páginas HTML
    if (request.destination === 'document') {
        const cachedIndex = await caches.match('/index.html');
        if (cachedIndex) {
            return cachedIndex;
        }
    }
    
    // Fallback para imagens
    if (request.destination === 'image') {
        return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="#f0f0f0"/><text x="100" y="75" text-anchor="middle" fill="#999" font-family="Arial, sans-serif" font-size="14">Imagem indisponível</text></svg>',
            {
                headers: {
                    'Content-Type': 'image/svg+xml',
                    'Cache-Control': 'no-cache'
                }
            }
        );
    }
    
    // Resposta genérica para outros recursos
    return new Response('Conteúdo indisponível offline', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
            'Content-Type': 'text/plain'
        }
    });
}

async function cleanOldCaches() {
    const cacheNames = await caches.keys();
    const deletePromises = cacheNames
        .filter(name => name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== IMAGE_CACHE)
        .map(name => {
            console.log('🗑️ Removendo cache antigo:', name);
            return caches.delete(name);
        });
    
    return Promise.all(deletePromises);
}

async function limitCacheSize(cache, limit) {
    const keys = await cache.keys();
    if (keys.length > limit) {
        // Remove as entradas mais antigas
        const deletePromises = keys
            .slice(0, keys.length - limit)
            .map(key => cache.delete(key));
        await Promise.all(deletePromises);
    }
}

/**
 * BACKGROUND SYNC PARA FORMULÁRIOS
 */
self.addEventListener('sync', event => {
    if (event.tag === 'form-submission') {
        event.waitUntil(handleFormSync());
    }
});

async function handleFormSync() {
    console.log('🔄 Sincronizando formulários offline...');
    
    try {
        // Recuperar dados de formulários armazenados
        const db = await openDB();
        const submissions = await getAllSubmissions(db);
        
        for (const submission of submissions) {
            try {
                const response = await fetch(submission.url, {
                    method: 'POST',
                    headers: submission.headers,
                    body: submission.data
                });
                
                if (response.ok) {
                    await deleteSubmission(db, submission.id);
                    console.log('✅ Formulário sincronizado:', submission.id);
                } else {
                    console.warn('⚠️ Erro ao sincronizar formulário:', response.status);
                }
            } catch (error) {
                console.error('❌ Erro na sincronização:', error);
            }
        }
    } catch (error) {
        console.error('❌ Erro no background sync:', error);
    }
}

/**
 * NOTIFICAÇÕES PUSH
 */
self.addEventListener('push', event => {
    if (!event.data) return;
    
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/assets/img/icon-192.png',
        badge: '/assets/img/badge-72.png',
        tag: data.tag || 'notification',
        data: data.data || {},
        actions: data.actions || [],
        requireInteraction: data.requireInteraction || false
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action) {
        // Ação específica do botão
        handleNotificationAction(event.action, event.notification.data);
    } else {
        // Clique principal na notificação
        event.waitUntil(
            clients.openWindow(event.notification.data.url || '/')
        );
    }
});

/**
 * UTILITÁRIOS PARA INDEXEDDB
 */
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('PlataformaONG', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = event => {
            const db = event.target.result;
            
            // Store para formulários offline
            if (!db.objectStoreNames.contains('formSubmissions')) {
                const store = db.createObjectStore('formSubmissions', { keyPath: 'id', autoIncrement: true });
                store.createIndex('timestamp', 'timestamp');
            }
        };
    });
}

async function getAllSubmissions(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['formSubmissions'], 'readonly');
        const store = transaction.objectStore('formSubmissions');
        const request = store.getAll();
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

async function deleteSubmission(db, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['formSubmissions'], 'readwrite');
        const store = transaction.objectStore('formSubmissions');
        const request = store.delete(id);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

/**
 * ANALYTICS OFFLINE
 */
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'TRACK_EVENT') {
        // Armazenar eventos para envio quando online
        storeAnalyticsEvent(event.data.payload);
    }
});

async function storeAnalyticsEvent(eventData) {
    try {
        const db = await openDB();
        const transaction = db.transaction(['analytics'], 'readwrite');
        const store = transaction.objectStore('analytics');
        
        await store.add({
            ...eventData,
            timestamp: Date.now(),
            synced: false
        });
    } catch (error) {
        console.warn('⚠️ Erro ao armazenar evento de analytics:', error);
    }
}

/**
 * LOGS E DEBUGGING
 */
if ('development' === 'development') {
    console.log('🔧 Service Worker em modo desenvolvimento');
    
    // Logs detalhados apenas em desenvolvimento
    self.addEventListener('fetch', event => {
        console.log('🌐 Fetch interceptado:', event.request.url);
    });
}

console.log('🚀 Service Worker da Plataforma ONG carregado com sucesso!');