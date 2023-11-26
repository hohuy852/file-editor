const { ipcRenderer } = require('electron');
var XLSX = require("xlsx");

class App {
    constructor() {

        window.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
        });
    }
    setupEventListeners() {
        const selectFileBtn = document.getElementById('selectFolderBtn');
        const openDialog = document.getElementById('openDialog');
        const exportButton = document.getElementById('exportBtn');
        const resultTable = document.getElementById('resultTable');

        selectFileBtn.addEventListener('click', () => {
            this.selectFolder();
        });

        openDialog.addEventListener('click', () => {
            this.editDialog();
        });

        exportButton.addEventListener('click', () => {
            this.exportExcel(resultTable);
        });
    }


    exportExcel(table) {
        var workbook = XLSX.utils.table_to_book(table, { sheet: 'sheet-1' });
        XLSX.writeFile(workbook, 'MyTable.xlsx');
    }


    importExcel(fileInput) {
        var file = fileInput.files[0];

        var reader = new FileReader();

        reader.onload = function (e) {
            var data = e.target.result;
            var workbook = XLSX.read(data, { type: 'binary' });

            // Assuming you have a single sheet in the workbook
            var sheetName = workbook.SheetNames[0];
            var sheet = workbook.Sheets[sheetName];

            // Convert the sheet data to a JSON object
            var jsonData = XLSX.utils.sheet_to_json(sheet);

            console.log(jsonData);
        };

        reader.readAsBinaryString(file);
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
                    <td contenteditable='true' class="editableCell">${item.newName}</td>
                `;
                tableBody.appendChild(row);
            });
        }
        const editableCells = document.querySelectorAll('.editableCell');

        editableCells.forEach((editableCell) => {
            editableCell.addEventListener('keydown', function (event) {
                if (event.key === 'Enter') {
                    console.log("asdsad");
                    event.returnValue = false
                    if (event.preventDefault) event.preventDefault()
                }
            });
        })
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
