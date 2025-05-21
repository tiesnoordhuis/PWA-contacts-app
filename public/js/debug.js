import ContactSelect from "contactSelect";
import Push from "push";
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

const activatePushNotificationButton = document.getElementById('activatePushNotification');
const setupPushNotifications = async (registration) => {
    const push = new Push(registration);
    debugElement.textContent += 'Push notifications supported. \n';
    activatePushNotificationButton.addEventListener('click', push.subscribe.bind(push));
}

const serviceWorkerCleanupFunctions = [];
try {
    serviceWorkerCleanupFunctions.push(await registerServiceWorker(setupPushNotifications, {debug: true}))
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
    serviceWorkerCleanupFunctions.push(await registerServiceWorker(setupPushNotifications, {debug: true}));
});
