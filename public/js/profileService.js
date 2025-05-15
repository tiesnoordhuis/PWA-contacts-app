export default class ProfileService {
    constructor(apiBaseUrl = '/api/') {
        this.apiBaseUrl = apiBaseUrl;
    }

    async profiles() {
        const response = await fetch(`${this.apiBaseUrl}profile`);
        if (!response.ok) {
            throw new Error('Failed to fetch profiles');
        }
        const profiles = await response.json();
        return profiles;
    }

    async saveProfile(profile) {
        const response = await fetch(`${this.apiBaseUrl}profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profile)
        });
        if (!response.ok) {
            throw new Error('Failed to save profile');
        }
        return await response.json();
    }
}