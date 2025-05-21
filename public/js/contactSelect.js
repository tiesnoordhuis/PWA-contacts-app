export default class ContactSelect {
    constructor(loadContactButtonId = 'loadContact') {
        this.loadContactButton = document.getElementById(loadContactButtonId);
        if (!this.loadContactButton) {
            throw new Error(`Element with id ${loadContactButtonId} not found`);
        }
        this.contactsSupported = 'contacts' in navigator && 'ContactsManager' in window;
    }

    init() {
        if (this.contactsSupported) {
            this.loadContactButton.addEventListener('click', this.loadContact);
        } else {
            this.loadContactButton.disabled = true;
        }
    }
    async loadContact() {
        try {
            const contacts = await navigator.contacts.select(['name', 'email']);
            document.getElementById('name').value = contacts[0]?.name[0] ?? '';
            document.getElementById('email').value = contacts[0]?.email[0] ?? '';
        } catch (error) {
            console.error('Error loading contact:', error);
        }
    }
}