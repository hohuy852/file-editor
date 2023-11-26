const { ipcRenderer } = require('electron');
class App {
    constructor() {
        window.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
        });
    }
    setupEventListeners() {
        const test = document.getElementById('test');
        test.addEventListener('click', (e) => {
            const newName = document.querySelector('#name').value;
            e.preventDefault()
            this.test(newName);
        });
    }

    test(name) {

        ipcRenderer.send('testfunction', name);
    }

}
ipcRenderer.on('smallWindow', (event, selectedPath) => { 
    console.log("321312");
})
// Instantiate the App
const app = new App();

