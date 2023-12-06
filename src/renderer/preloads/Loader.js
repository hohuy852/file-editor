const { ipcRenderer } = require('electron');

class App {
    constructor() {
        window.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
        });
    }

    setupEventListeners() {
        console.log("init")
    }

    updateHTMLContent(data) {
        const pathElement = document.querySelector('#path');
        const percentageElement = document.querySelector('#percentage');
        const loader = document.querySelector('.loader');

        // Update HTML elements with the received data
        pathElement.textContent = data.folderPath || '';
        percentageElement.textContent = data.percent ? `${data.percent}%` : '';

        if (loader) {
            const gradientValue = `linear-gradient(to right, #4caf50 ${data.percent}%, white 0%)`;
            loader.style.background = gradientValue;
        }
    }
}
const app = new App();

ipcRenderer.on('progressUpdate', (event, progress) => {
    // Handle the progress update in the renderer process
    app.updateHTMLContent(progress) 
    // You can update your UI or perform any other actions based on the progress value
});

ipcRenderer.on('loadedSuccess', (event, msg) => {
    const msgEl = document.querySelector('.msg');
    // Handle the progress update in the renderer process
    msgEl.textContent = msg || '';
    // You can update your UI or perform any other actions based on the progress value
});