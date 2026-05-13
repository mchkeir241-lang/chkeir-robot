// CHKEIR ROBOT v11 - Aggressive Auto-Update
// Always fetches latest from network, no aggressive caching

const VERSION = 'v11-' + new Date().toISOString().split('T')[0];

// Install: skip waiting immediately
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// Activate: claim clients and clear all old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((names) => {
            // Delete ALL old caches
            return Promise.all(names.map(name => caches.delete(name)));
        }).then(() => self.clients.claim())
    );
});

// Fetch: ALWAYS network first, no cache
self.addEventListener('fetch', (event) => {
    // Don't intercept API calls
    if (event.request.url.includes('/api/')) return;
    
    // Don't intercept non-GET
    if (event.request.method !== 'GET') return;
    
    // Don't intercept external resources
    if (!event.request.url.startsWith(self.location.origin)) return;
    
    // Always go to network - no cache
    event.respondWith(
        fetch(event.request, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        }).catch(() => {
            // Only as last resort
            return new Response('', { status: 503 });
        })
    );
});

// Listen for messages
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
