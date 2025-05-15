const CACHE_NAME = "pwa-cache-v1";
const urlsToCache = [
    "index.html",
    "js/script.js",
    "js/camera.js",
    "css/style.css",
    "circle.svg",
    "favicon.ico",
];

const putInCache = async (request, response) => {
    const url = new URL(request.url);
    if (!url.protocol.startsWith("http") || request.method !== "GET") {
        return;
    }
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response);
};

const networkFirst = async (request) => {
    // If online, try to fetch the resource from the network
    if (navigator.onLine) {
        const responseFromNetwork = await fetch(request);
        putInCache(request, responseFromNetwork.clone());
        return responseFromNetwork;
    }
    // If offline, try to fetch the resource from the cache
    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
        return responseFromCache;
    }
    return new Response("Network error happened", {
        status: 408,
        headers: { "Content-Type": "text/plain" },
    });
};

self.addEventListener("fetch", (event) => {
    event.respondWith(
        networkFirst(event.request),
    );
});

self.addEventListener("install", async (event) => {
    const preCache = async () => {
        const cache = await caches.open(CACHE_NAME);
        return cache.addAll(urlsToCache);
    }
    event.waitUntil(preCache());
});

self.addEventListener('push', event => {
    const data = event.data?.json() || { title: 'Default title', body: 'Default body' };
    console.log('Push event received:', data);

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
        })
    );
});

// Utility function to send messages to clients
async function broadcastMessage(type, message) {
    const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
    console.log(`[${type}] ${clients.length} clients`, clients);
    clients.forEach(client => {
        client.postMessage({
            type,
            payload: { message },
        });
    });
}

self.addEventListener('install', async () => {
    console.log('Service Worker: install event');
    await broadcastMessage('SW_INSTALLING', 'Service Worker is installing and caching resources.');
});

self.addEventListener('activate', async () => {
    console.log('Service Worker: activate event');
    await broadcastMessage('SW_ACTIVATED', 'Service Worker is activated and ready to handle requests.');
});

self.addEventListener('fetch', async (event) => {
    console.log('Service Worker: fetch event', event.request.url);
    await broadcastMessage('SW_FETCH', `Fetching: ${event.request.url}`);
});

self.addEventListener('push', async (event) => {
    const data = event.data?.text() || 'No payload';
    console.log('Service Worker: push event', data);
    await broadcastMessage('SW_PUSH', `Push event received: ${data}`);
});

self.addEventListener('notificationclick', async (event) => {
    console.log('Service Worker: notification click', event.notification.data);
    await broadcastMessage('SW_NOTIFICATION_CLICK', `Notification clicked: ${event.notification.data}`);
});

self.addEventListener('notificationclose', async (event) => {
    console.log('Service Worker: notification close', event.notification.data);
    await broadcastMessage('SW_NOTIFICATION_CLOSE', `Notification closed: ${event.notification.data}`);
});

self.addEventListener('message', async (event) => {
    console.log('Service Worker: message event', event.data);
    await broadcastMessage('SW_MESSAGE', `Message received from client: ${event.data}`);
});

self.addEventListener('sync', async (event) => {
    console.log('Service Worker: sync event', event.tag);
    await broadcastMessage('SW_SYNC', `Background sync event: ${event.tag}`);
});
