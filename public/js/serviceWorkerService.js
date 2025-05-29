// Registers the Service Worker
async function registerServiceWorker({ debug = false, scope = '/', timeout = 10_000 } = {}) {
    if (!('serviceWorker' in navigator)) {
        throw new Error('Service Workers not supported');
    }

    const url = new URL('/service-worker.js', location.href);
    if (debug) {
        url.searchParams.set('debug', 'true');
    }

    const registration = await navigator.serviceWorker.register(url, { scope });
    if (registration.active) {
        return registration;
    }
    
    let worker = registration.installing ?? registration.waiting;
    await new Promise((resolve, reject) => {
        const handleStateChange = (event) => {
            if (event.target.state === 'activated') {
                worker.removeEventListener('statechange', handleStateChange);
                clearTimeout(timer);
                resolve();
            }
        };

        const handleUpdateFound = (event) => {
            if (event.target.installing) {
                worker = registration.installing;
                worker.addEventListener('statechange', handleStateChange);
                registration.removeEventListener('updatefound', handleUpdateFound);
            }
        }

        if (worker?.state === 'activated') {
            resolve();
        } else if (worker) {
            worker.addEventListener('statechange', handleStateChange);
        } else {
            registration.addEventListener('updatefound', handleUpdateFound);
        }

        const timer = setTimeout(() => {
            worker?.removeEventListener('statechange', handleStateChange);
            registration.removeEventListener('updatefound', handleUpdateFound);
            reject(new Error('Service Worker activation timed out'));
        }, timeout);
    })

    return registration;
}

// Unregister the Service Worker.
async function unregisterServiceWorker() {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
        throw new Error('No Service Worker registered');
    }
    return registration.unregister();
}

export { registerServiceWorker, unregisterServiceWorker };