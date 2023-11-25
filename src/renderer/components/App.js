const { ipcRenderer } = require('electron');

class App {
    constructor() {

        window.addEventListener('DOMContentLoaded', () => {
            // this.render();
            this.setupEventListeners();
        });
    }

    // render() {
    //     const appElement = document.getElementById('app');
    //     if (appElement) {
    //         appElement.innerHTML = `
    //             <h1>Hello World!</h1>
    //             <button id="selectFileBtn" style="padding: 10px; background-color: #3498db; color: #fff; border: none; cursor: pointer;">Select Folder</button>
    //             <div id="folderContents"></div>
    //         `;
    //     }
        
    // }

    setupEventListeners() {
        const selectFileBtn = document.getElementById('selectFileBtn');
        selectFileBtn.addEventListener('click', () => {
            console.log("#12312");
            this.selectFolder();
        });
    }

    selectFolder() {
        ipcRenderer.send('openFolderDialog');
    }

    displayFolderContents(contents) {
        const folderContentsElement = document.getElementById('folderContents');
        if (folderContentsElement) {
            const tableBody = folderContentsElement.querySelector('tbody');

            // Clear existing table rows
            tableBody.innerHTML = '';

            // Loop through contents and create table rows
            contents.forEach(item => {
                console.log(item);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.path}</td>
                    <td>${item.name}</td>
                    <td>${item.newName}</td>
                    <td>${item.fileType}</td>
                    <td>${item.size}</td>
                `;
                tableBody.appendChild(row);
            });
        }
    }
}

// Instantiate the App
const app = new App();

// Listen for the response from the main process to display folder contents
ipcRenderer.on('folderContents', (event, contents) => {
    app.displayFolderContents(contents);
});

// Listen for an error response from the main process
ipcRenderer.on('folderContentsError', (event, error) => {
    console.error('Error getting folder contents:', error);
});
