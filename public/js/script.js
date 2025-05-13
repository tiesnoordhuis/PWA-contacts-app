import Camera from 'camera';

// register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    });
}

const camera = new Camera();
const videoElement = document.getElementById('cameraFeed');
const startButton = document.getElementById('startCamera');
const stopButton = document.getElementById('stopCamera');

startButton.addEventListener('click', async () => {
    videoElement.srcObject = await camera.getStream();
    videoElement.play();
});

stopButton.addEventListener('click', () => {
    camera.stopStream();
    videoElement.srcObject = null;
});

const profileTemplate = document.getElementById('profileTemplate');
const profileForm = document.getElementById('profileForm');
const takePhotoButton = document.getElementById('takePhoto');

takePhotoButton.addEventListener('click', (event) => {
    event.preventDefault();
    const canvas = document.getElementById('photoCanvas')
    const context = canvas.getContext('2d');
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
});

profileForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    // get the image data from the video element
    const canvas = document.getElementById('photoCanvas')
    // use high compression
    const imageData = canvas.toDataURL('image/jpeg', 0.5);
    
    await fetch('/api/profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: formData.get('name'),
            email: formData.get('email'),
            photo: imageData
        })
    });
})

const profiles = await fetch('/api/profile')
    .then(response => response.json())

profiles.forEach(profile => {
    const clone = profileTemplate.content.cloneNode(true);
    clone.querySelector('.name').textContent = profile.name;
    clone.querySelector('.email').textContent = profile.email;
    clone.querySelector('img.photo').src = profile.photo;
    document.getElementById('profilesContainer').appendChild(clone);
})

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
