import Push from "push";

const debugElement = document.getElementById('debugElement');

debugElement.textContent = 'Debug log: \n';

const registerServiceWorker = async () => {
    const registration = await navigator.serviceWorker.register('service-worker.js')
    registration.addEventListener('updatefound', () => {
        registration.installing?.addEventListener('statechange', (event) => {
            if (event.target.state === 'activated') {
                new Push(registration).init();
            }
        });
    });

    registration.addEventListener('updatefound', (event) => {
        const state = event.target.active ? event.target.active.state : event.target.installing ? event.target.installing.state : event.target.waiting ? event.target.waiting.state : 'unknown';
        debugElement.textContent += `Service Worker registration update found with event target type [${event.target.constructor.name}] and state [${state}] \n`;
        const worker = registration.installing ?? registration.waiting ?? registration.active;
        if (worker) {
            worker.addEventListener('statechange', (event) => {
                debugElement.textContent += `Service Worker state changed with target type [${event.target.constructor.name}] and state [${event.target.state ?? worker.state}] \n`;
            });
        }
    });

    navigator.serviceWorker.addEventListener('message', event => {
        const { type, payload } = event.data;
        const time = new Date().toLocaleTimeString();
        debugElement.textContent += `[${time}] ${type}: ${payload.message} \n`;
    })

    navigator.serviceWorker.addEventListener('controllerchange', () => {
        debugElement.textContent += 'Service Worker controller changed. \n';
    })
}

// register service worker
if ('serviceWorker' in navigator) {
    registerServiceWorker()
} else {
    debugElement.textContent += 'Service Worker not supported in this browser. \n';
}

const unRegisterButton = document.getElementById('unregisterServiceWorker');

unRegisterButton.addEventListener('click', async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
        await registration.unregister();
        debugElement.textContent += 'Service Worker unregistered. \n';
    } else {
        debugElement.textContent += 'No Service Worker registered. \n';
    }
});

const registerButton = document.getElementById('registerServiceWorker');
registerButton.addEventListener('click', async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
        debugElement.textContent += 'Service Worker already registered. \n';
    } else {
        registerServiceWorker();
        debugElement.textContent += 'Service Worker registered. \n';
    }
});