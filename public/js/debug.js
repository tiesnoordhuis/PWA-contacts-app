import ContactSelect from "contactSelect";
import { registerServiceWorker, unregisterServiceWorker } from "serviceWorkerService";

new ContactSelect().init();

const debugElement = document.getElementById('debugElement');

debugElement.textContent = 'Debug log: \n';

if ('getBattery' in navigator) {
    navigator.getBattery().then(battery => {
        debugElement.textContent += `Battery level: ${battery.level * 100}% \n`;
        battery.addEventListener('levelchange', () => {
            debugElement.textContent += `Battery level changed: ${battery.level * 100}% \n`;
        });
    });
}

const serviceWorkerCleanupFunctions = [];
try {
    serviceWorkerCleanupFunctions.push(await registerServiceWorker({debug: true}))
} catch (error) {
    debugElement.textContent += 'Service Worker not supported in this browser. \n';
}

const unRegisterButton = document.getElementById('unregisterServiceWorker');

unRegisterButton.addEventListener('click', async () => {
    serviceWorkerCleanupFunctions.forEach(cleanup => cleanup());
    try {
        unregisterServiceWorker();
        debugElement.textContent += 'Service Worker unregistered. \n';
    } catch (error) {
        debugElement.textContent += 'No Service Worker registered. \n';
    }
});

const registerButton = document.getElementById('registerServiceWorker');
registerButton.addEventListener('click', async () => {
    debugElement.textContent += 'Trying to register Service Worker. \n';
    serviceWorkerCleanupFunctions.push(await registerServiceWorker({debug: true}));
});
