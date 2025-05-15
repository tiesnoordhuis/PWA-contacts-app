import CameraUI from "cameraUI";
import ProfileUI from "profileUI";
import Push from "push";

new CameraUI().init();

new ProfileUI().init();

const loadContactButton = document.getElementById('loadContact');
const contactsSupported = 'contacts' in navigator && 'ContactsManager' in window;
const loadContact = async () => {
    const contacts = await navigator.contacts.select(['name', 'email']);
    document.getElementById('name').value = contacts[0]?.name[0] ?? '';
    document.getElementById('email').value = contacts[0]?.email[0] ?? '';
}

if (contactsSupported) {
    document.getElementById('loadContact').addEventListener('click', loadContact);
} else {
    loadContactButton.disabled = true;
}

// register service worker
if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.register('service-worker.js')
    registration.addEventListener('updatefound', () => {
        registration.installing?.addEventListener('statechange', (event) => {
            if (event.target.state === 'activated') {
                new Push(registration).init();
            }
        });
    });
}