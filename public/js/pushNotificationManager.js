export default class PushNotificationMangager {
    constructor(
        serviceWorkerRegistration,
    ) {
        this.pushManager = serviceWorkerRegistration.pushManager;
        if (!this.pushManager) {
            throw new Error('Service Worker Push Manager not available');
        }
        if (!("Notification" in window)) {
            throw new Error('Push notifications not supported in this browser');
        }
    }

    async requestNotificationPermission() {
        try {
            const permission = await Notification.requestPermission();
            console.log('Notification permission:', permission);
            const permissionState = await this.pushManager.permissionState({
                userVisibleOnly: true
            });
            console.log('Notification permission state:', permissionState);
            return (permission === 'granted' && permissionState === 'granted')
        } catch (error) {
            console.error('Error requesting Push notification permission:', error);
            return false;
        }
    }

    async subscribe() {
        const permissionGranted = await this.requestNotificationPermission();
        if (!permissionGranted) {
            console.error('Push notifications are not granted');
            return;
        }

        const subscription = await this.pushManager.getSubscription();
        if (subscription) {
            console.log('Already subscribed to push notifications');
            return subscription;
        }

        try {
            const newSubscription = await this.registerForPushNotifications();
            console.log('Successfully subscribed to push notifications:', newSubscription);
            return newSubscription;
        } catch (error) {
            console.error('Failed to subscribe to push notifications:', error);
        }
    }

    async getServerPublicVAPIDKey() {
        const res = await fetch('/api/applicationServerKey');
        if (!res.ok) {
            throw new Error('Failed to fetch VAPID key');
        }
        const { applicationServerKey } = await res.json();
        return PushNotificationMangager.urlBase64ToUint8Array(applicationServerKey);
    }

    async registerForPushNotifications() {
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
}