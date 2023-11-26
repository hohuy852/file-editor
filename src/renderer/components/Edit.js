const { ipcRenderer } = require('electron');
class App {
    constructor() {
        window.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
        });
    }
    setupEventListeners() {
        const test = document.getElementById('test');
        test.addEventListener('click', () => {
            console.log("#12312");
            this.test();
        });

    
    }

    test() {
        ipcRenderer.send('testfunction');
    }

}

// Instantiate the App
const app = new App();

