import ProfileService from "profileService";

export default class ProfileUI {
    constructor(
        profileService = new ProfileService(),
        profileTemplateId = 'profileTemplate',
        profileFormId = 'profileForm',
        profilesContainerId = 'profilesContainer',
        photoCanvasId = 'photoCanvas'
    ) {
        this.profileService = profileService;
        this.profileTemplate = document.getElementById(profileTemplateId);
        this.profileForm = document.getElementById(profileFormId);
        this.profilesContainer = document.getElementById(profilesContainerId);
        this.photoCanvas = document.getElementById(photoCanvasId);

        if (!this.profileTemplate || !this.profileForm || !this.profilesContainer || !this.photoCanvas) {
            throw new Error('One or more elements not found');
        }
    }
    async init() {
        this.renderProfiles();
        this.profileForm.addEventListener('submit', this.saveProfile);
    }
    
    async renderProfiles() {
        const profiles = await this.profileService.profiles();
        this.profilesContainer.innerHTML = ''; // Clear existing profiles
        profiles.forEach(profile => {
            const clone = this.profileTemplate.content.cloneNode(true);
            clone.querySelector('.name').textContent = profile.name;
            clone.querySelector('.email').textContent = profile.email;
            clone.querySelector('img.photo').src = profile.photo;
            this.profilesContainer.appendChild(clone);
        });
    }

    saveProfile = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const photo = this.photoCanvas.toDataURL('image/jpeg', 0.8);

        await this.profileService.saveProfile({
            name: formData.get('name'),
            email: formData.get('email'),
            photo: photo
        });

        this.profileForm.reset();
        this.renderProfiles();
    }
}