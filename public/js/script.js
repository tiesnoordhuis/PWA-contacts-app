import CameraUI from "cameraUI";
import ProfileUI from "profileUI";
import ContactSelect from "contactSelect";
import Push from "push";
import { registerServiceWorker } from "serviceWorkerService";

new CameraUI().init();
new ProfileUI().init();
new ContactSelect().init();

const setupPushNotifications = async (registration) => {
    const push = new Push(registration);
    push.subscribe();
}
// register service worker
registerServiceWorker(setupPushNotifications, {debug: true});