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
        percentageElement.textContent = data.percentage ? `${data.percentage}%` : '';
        if (loader) {
            const gradientValue = `linear-gradient(to right, black ${data.overallPercentage}%, white 0%)`;
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