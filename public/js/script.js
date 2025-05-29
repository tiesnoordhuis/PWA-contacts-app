import CameraUI from "cameraUI";
import ProfileUI from "profileUI";
import ContactSelect from "contactSelect";
import PushNotificationMangager from "pushNotificationManager";
import { registerServiceWorker } from "serviceWorkerService";

new CameraUI().init();
new ProfileUI().init();
new ContactSelect().init();

const serviceWorkerRegistration = await registerServiceWorker({ debug: true });
const pushNotificationManager = new PushNotificationMangager(serviceWorkerRegistration);
pushNotificationManager.subscribe()

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