import Camera from 'camera';

const camera = new Camera();
const videoElement = document.getElementById('cameraFeed');
const startButton = document.getElementById('startCamera');
const stopButton = document.getElementById('stopCamera');
const errorMessage = document.getElementById('errorMessage');

startButton.addEventListener('click', async () => {
    try {
        videoElement.srcObject = await camera.getStream();
        videoElement.play();
    } catch (error) {
        errorMessage.textContent = error.message;
    }
});

stopButton.addEventListener('click', () => {
    camera.stopStream();
    videoElement.srcObject = null;
});