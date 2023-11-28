const { ipcRenderer, dialog } = require("electron");
const path = require("path");
const fse = require("fs-extra");
var XLSX = require("xlsx");

class App {
  constructor() {
    window.addEventListener("DOMContentLoaded", () => {
      this.setupEventListeners();
    });
  }
  setupEventListeners() {
    const selectFolderBtn = document.getElementById("selectFolderBtn");
    const importBtn = document.getElementById("importBtn");
    const openDialog = document.getElementById("openDialog");
    const exportButton = document.getElementById("exportBtn");

    selectFolderBtn.addEventListener("click", () => {
      this.selectFolder();
    });
    importBtn.addEventListener("click", () => {
      this.openFile();
    });
    openDialog.addEventListener("click", () => {
      this.editDialog();
    });

    exportButton.addEventListener("click", () => {
      this.saveExportFile();
    });
  }


  updateTable(jsonData) {
    const tableBody = document
      .getElementById("resultTable")
      .getElementsByTagName("tbody")[0];

    // Clear existing table rows
    tableBody.innerHTML = "";

    // Add new rows based on the JSON data
    jsonData.forEach((row) => {
      const newRow = tableBody.insertRow();

      // Assuming the keys in the JSON data match the table headers
      for (const key in row) {
        const cell = newRow.insertCell();
        cell.appendChild(document.createTextNode(row[key]));
      }
    });
  }

  editDialog() {
    ipcRenderer.send("handleEditDialog");
  }

  saveExportFile() {
    ipcRenderer.send("export");
  }
  selectFolder() {
    ipcRenderer.send("chooseEditFolder");
  }
  openFile() {
    ipcRenderer.send("openFile");
  }
  exportFolder() {
    ipcRenderer.send("chooseExportFolder");
  }

  displayFolderContents(contents) {
    const folderContentsElement = document.getElementById("folderContents");
    if (folderContentsElement) {
      const tableBody = folderContentsElement.querySelector("tbody");

      // Clear existing table rows
      tableBody.innerHTML = "";
      // Sort contents by the number of slashes in the path, with more slashes first
      contents.sort((a, b) => {
        const slashesA = (a.path.match(/\\/g) || []).length;
        const slashesB = (b.path.match(/\\/g) || []).length;

        return slashesB - slashesA || a.path.localeCompare(b.path);
      });

      // Render the sorted contents
      contents.forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                <td>${item.path}</td>
                <td>${item.name}</td>
                <td contenteditable='true' class="editableCell">${item.newName}</td> `;
        tableBody.appendChild(row);
      });
    }
    const editableCells = document.querySelectorAll(".editableCell");

    editableCells.forEach((editableCell) => {
      editableCell.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          console.log("asdsad");
          event.returnValue = false;
          if (event.preventDefault) event.preventDefault();
        }
      });
    });
  }

  replaceLastDirectoryName(folderPath, replaceString) {
    try {
      const parentPath = path.dirname(folderPath);
      const renamedPath = path.join(parentPath, replaceString);

      console.log("Before renaming - folderPath:", folderPath);
      console.log("Before renaming - renamedPath:", renamedPath);

      fse.move(folderPath, renamedPath, { overwrite: true }, (error) => {
        if (error) {
          console.error("Error replacing last directory name:", error);
        } else {
          console.log("Last directory name replaced successfully.");
        }
      });
    } catch (error) {
      console.error("Error replacing last directory name:", error);
    }
  }
}

// Instantiate the App
const app = new App();

// Listen for the response from the main process to display folder contents
ipcRenderer.on("folderContents", (event, contents) => {
  app.displayFolderContents(contents);
});

// Listen for an error response from the main process
ipcRenderer.on("folderContentsError", (event, error) => {
  console.error("Error getting folder contents:", error);
});

// Listen for an error response from the main process
ipcRenderer.on("savePath", async (event, filePath) => {
  const resultTable = document.getElementById("resultTable");

  // Open save dialog and get the selected file path
  if (filePath) {
    var workbook = XLSX.utils.table_to_book(resultTable, { sheet: "sheet-1" });

    // Use the selected file path for saving the file
    XLSX.writeFile(workbook, filePath);

    // Optionally, you can update outputPath or perform other actions with the file path
    console.log("File saved at:", filePath);
  } else {
    console.log("Export canceled or encountered an error.");
  }
});

ipcRenderer.on("changeFolderName", (event, name) => {
  const folderContentsElement = document.getElementById("folderContents");
  const tableBody = folderContentsElement.querySelector("tbody");
  console.log("213213");
  let counter = 1; // Initialize a counter for unique identifiers

  // Iterate over all rows in the table
  const rows = tableBody.querySelectorAll("tr");
  rows.forEach((row) => {
    // Get the path from the first cell in the current row
    const pathCell = row.querySelector("td:first-child");
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

ipcRenderer.on('selectedFile', (event, filePath)=>{
    const reader = new FileReader();
    reader.onload = function (e) {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });

      // Assuming you have a single sheet in the workbook
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convert the sheet data to a JSON object
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      // Convert JSON data to HTML table
      const htmlTable = app.updateTable(jsonData);

      // Log or use the HTML table as needed
      console.log(htmlTable);
    };

    // Read the selected file
    const file = fse.readFileSync(filePath);
    reader.readAsBinaryString(new Blob([file]));
})