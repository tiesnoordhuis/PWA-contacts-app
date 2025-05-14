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
    if (!url.protocol.startsWith("http")) {
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

self.addEventListener("install", (event) => {
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