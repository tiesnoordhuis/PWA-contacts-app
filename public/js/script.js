import CameraUI from "cameraUI";
import ProfileUI from "profileUI";
import ContactSelect from "contactSelect";
import { registerServiceWorker } from "serviceWorkerService";

new CameraUI().init();
new ProfileUI().init();
new ContactSelect().init();

// register service worker
registerServiceWorker({debug: true});