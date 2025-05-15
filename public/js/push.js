export default class Push {
    constructor(
        serviceWorkerRegistration,
        testPushNotificationButtonId = 'testPushNotification',
    ) {
        this.testPushNotificationButton = document.getElementById(testPushNotificationButtonId);
        if (!this.testPushNotificationButton) {
            throw new Error('Test Push Notification button not found');
        }
        if (!serviceWorkerRegistration.pushManager) {
            throw new Error('Service Worker Push Manager not available');
        }
        this.pushManager = serviceWorkerRegistration.pushManager;
    }

    async init() {
        if (Notification.permission !== 'granted') {
            await Notification.requestPermission();
        }
        this.registerForPush();
        this.testPushNotificationButton.addEventListener('click', this.testPushNotification);
    }

    async getServerPublicVAPIDKey() {
        const res = await fetch('/api/applicationServerKey');
        if (!res.ok) {
            throw new Error('Failed to fetch VAPID key');
        }
        const { applicationServerKey } = await res.json();
        return Push.urlBase64ToUint8Array(applicationServerKey);
    }
    async registerForPush() {
        const serverPublicVAPIDKey = await this.getServerPublicVAPIDKey();

        const subscription = await this.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: serverPublicVAPIDKey
        });

        return fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscription)
        });
    }

    static urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = atob(base64);
        return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
    }

    testPushNotification = async () => {
        const res = await fetch('/api/test-push');
        const { sent, failed } = await res.json();
        console.log(`Push notifications sent: ${sent}, failed: ${failed}`);
    }
}