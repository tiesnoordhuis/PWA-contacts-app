// Registers the Service Worker and returns a cleanup function.
async function registerServiceWorker(activationCallback = () => {}, {debug = false} = {}) {
    if (!('serviceWorker' in navigator)) {
        throw new Error('Service Workers not supported');
    }

    const url = new URL('/service-worker.js', location.href);
    if (debug) {
        url.searchParams.set('debug', 'true');
    }

    let registration;
    try {
        registration = await navigator.serviceWorker.register(url, { scope: '/' });
        // Check if the Service Worker is unchanged and controlling the page.
        if (registration.active) {
            activationCallback(registration);
        } else {
            console.log('Service Worker registered, waiting for activation...');
        }
    } catch (err) {
        console.error('Service Worker registration failed:', err);
        throw err;
    }

    const handleStateChange = (event) => {
        if (event.target.state === 'activated') {
            activationCallback(registration);
        }
    };

    const handleUpdateFound = () => {
        registration.installing?.addEventListener('statechange', handleStateChange);
    };

    registration.addEventListener('updatefound', handleUpdateFound);

    // Cleanup function to remove listeners.
    return () => {
        registration.removeEventListener('updatefound', handleUpdateFound);
        registration.installing?.removeEventListener('statechange', handleStateChange);
    };
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