import Camera from 'camera';

export default class CameraUI {
    constructor(
        camera = new Camera(),
        videoElementId = 'cameraFeed',
        startButtonId = 'startCamera',
        stopButtonId = 'stopCamera',
        takePhotoButtonId = 'takePhoto',
        canvasId = 'photoCanvas'
    ) {
        this.camera = camera;
        this.videoElement = document.getElementById(videoElementId);
        this.startButton = document.getElementById(startButtonId);
        this.stopButton = document.getElementById(stopButtonId);
        this.takePhotoButton = document.getElementById(takePhotoButtonId);
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext('2d');
        
        if (!this.videoElement || !this.startButton || !this.stopButton || !this.takePhotoButton || !this.canvas) {
            throw new Error('One or more elements not found');
        }
    }

    init() {
        this.startButton.addEventListener('click', async () => {
            this.videoElement.srcObject = await this.camera.getStream();
            this.videoElement.play();
        }
        );
        this.stopButton.addEventListener('click', () => {
            this.camera.stopStream();
            this.videoElement.srcObject = null;
        });
        this.takePhotoButton.addEventListener('click', (event) => {
            event.preventDefault();
            this.context.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
        });
    }   
}