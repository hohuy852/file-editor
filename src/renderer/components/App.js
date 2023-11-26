const { ipcRenderer } = require('electron');
class App {
    constructor() {

        window.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
        });
    }
    setupEventListeners() {
        const selectFileBtn = document.getElementById('selectFolderBtn');
        const openDialog = document.getElementById('openDialog');

        selectFileBtn.addEventListener('click', () => {
            this.selectFolder();
        });
        openDialog.addEventListener('click', () => {
            this.editDialog();
        });
    }

    editDialog() {
        ipcRenderer.send('handleEditDialog');
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
                    <td contenteditable='true' id="editableCell">${item.newName}</td>
                    <td>${item.fileType}</td>
                    <td >${item.size}</td>
                `;
                tableBody.appendChild(row);
            });
        }
        const editableCell = document.getElementById('editableCell');

        editableCell.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                if (!e) {
                    e = window.event;
                }
                if (e.preventDefault) {
                    e.preventDefault();
                } else {
                    e.returnValue = false;
                }
            }
        });
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
