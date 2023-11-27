const { ipcRenderer } = require('electron');
const path = require('path');
const fse = require('fs-extra');
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

        selectFileBtn.addEventListener('click', () => {
            this.selectFolder();
        });

        openDialog.addEventListener('click', () => {
            this.editDialog();
        });

        exportButton.addEventListener('click', () => {
            this.exportFolder();
            // this.exportExcel(resultTable);
        });
    }


    // exportExcel(table) {

    // }


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
        ipcRenderer.send('chooseEditFolder');
    }

    exportFolder() {
        ipcRenderer.send('chooseExportFolder');
    }

    displayFolderContents(contents) {
        const folderContentsElement = document.getElementById('folderContents');
        if (folderContentsElement) {
            const tableBody = folderContentsElement.querySelector('tbody');

            // Clear existing table rows
            tableBody.innerHTML = '';
            // Sort contents by the number of slashes in the path, with more slashes first
            contents.sort((a, b) => {
                const slashesA = (a.path.match(/\\/g) || []).length;
                const slashesB = (b.path.match(/\\/g) || []).length;

                return slashesB - slashesA || a.path.localeCompare(b.path);
            });

            // Render the sorted contents
            contents.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                <td>${item.path}</td>
                <td>${item.name}</td>
                <td contenteditable='true' class="editableCell">${item.newName}</td> `;
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


    replaceLastDirectoryName(folderPath, replaceString) {
        try {
            const parentPath = path.dirname(folderPath);
            const renamedPath = path.join(parentPath, replaceString);

            console.log('Before renaming - folderPath:', folderPath);
            console.log('Before renaming - renamedPath:', renamedPath);

            fse.move(folderPath, renamedPath, { overwrite: true }, (error) => {
                if (error) {
                    console.error('Error replacing last directory name:', error);
                } else {
                    console.log('Last directory name replaced successfully.');
                }
            });
        } catch (error) {
            console.error('Error replacing last directory name:', error);
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
// Listen for an error response from the main process
ipcRenderer.on('exportPath', (event, selectedPath) => {
    if (selectedPath) {
        const resultTable = document.getElementById('resultTable');
        const baseFileName = 'MyTable'; // Use user input or default name
        const extension = '.xlsx';
        let fileName = baseFileName + extension;
        let counter = 1;
        // Check if the file already exists, if yes, increment the counter
        while (fse.existsSync(path.join(selectedPath, fileName))) {
            fileName = `${baseFileName}(${counter})${extension}`;
            counter++;
        }
        const outputPath = path.join(selectedPath, fileName);
        var workbook = XLSX.utils.table_to_book(resultTable, { sheet: 'sheet-1' });
        console.log("232");
        XLSX.writeFile(workbook, outputPath);
    }
});

ipcRenderer.on('changeFolderName', (event, name) => {
    const folderContentsElement = document.getElementById('folderContents');
    const tableBody = folderContentsElement.querySelector('tbody');
    console.log("213213");
    let counter = 1; // Initialize a counter for unique identifiers

    // Iterate over all rows in the table
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
        // Get the path from the first cell in the current row
        const pathCell = row.querySelector('td:first-child');
        const currentPath = pathCell.textContent;

        // Replace the last directory name in the current path with a unique identifier
        const newName = name + counter;
        app.replaceLastDirectoryName(currentPath, newName);

        // Update the path cell with the new path
        pathCell.textContent = path.join(path.dirname(currentPath), newName);

        // Increment the counter for the next iteration
        counter++;
    });
});
