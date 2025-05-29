import ContactSelect from "contactSelect";
import PushNotificationMangager from "pushNotificationManager";
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

let serviceWorkerRegistration

const unRegisterButton = document.getElementById('unregisterServiceWorker');
unRegisterButton.addEventListener('click', async () => {
    debugElement.textContent += 'Trying to unregister Service Worker. \n';
    try {
        unregisterServiceWorker();
        debugElement.textContent += 'Service Worker unregistered. \n';
    } catch (error) {
        debugElement.textContent += `Error unregistering Service Worker: ${error.message} \n`;
    }
});

const registerButton = document.getElementById('registerServiceWorker');
registerButton.addEventListener('click', async () => {
    debugElement.textContent += 'Trying to register Service Worker. \n';
    try {
        serviceWorkerRegistration = await registerServiceWorker();
        debugElement.textContent += 'Service Worker registered successfully. \n';
    } catch (error) {
        debugElement.textContent += `Error registering Service Worker: ${error.message} \n`;
    }
});

const activatePushNotificationButton = document.getElementById('activatePushNotification');
activatePushNotificationButton.addEventListener('click', async () => {
    if (!serviceWorkerRegistration) {
        debugElement.textContent += 'Service Worker not registered. Please register it first. \n';
        return;
    }
    debugElement.textContent += 'Trying to activate Push Notifications. \n';
    try {
        const pushNotificationManager = new PushNotificationMangager(serviceWorkerRegistration);
        await pushNotificationManager.subscribe();
        debugElement.textContent += 'Push Notifications activated successfully. \n';
    } catch (error) {
        debugElement.textContent += `Error activating Push Notifications: ${error.message} \n`;
    }
});

const testPushNotificationButton = document.getElementById('testPushNotification');
testPushNotificationButton.addEventListener('click', async () => {
    try {
        const response = await fetch('/api/test-push');
        if (!response.ok) {
            throw new Error('Failed to send test push notification');
        }
        debugElement.textContent += 'Test Push Notification sent successfully. \n';
    } catch (error) {
        debugElement.textContent += `Error sending test Push Notification: ${error.message} \n`;
    }
});