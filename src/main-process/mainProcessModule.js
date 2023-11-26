// src/main-process/mainProcessModule.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fse = require('fs-extra');
const path = require('path');
const { HandleCreateEdit } = require('./Module/FolderNameEdit');
const dirTree = require("directory-tree");


let mainWindow;
app.disableHardwareAcceleration();

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, '../renderer/components/App.js')
        }
    });
    mainWindow.maximize()
    const indexPath = path.join(__dirname, '../index.html');
    mainWindow.loadFile(indexPath);

    // Set mainWindow to null when the window is closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    return mainWindow; // Return the created window
}



HandleCreateEdit()
ipcMain.on('handleEditDialog', (event) => {
   event.reply("smallWindow")
});
ipcMain.on('getFolderContents', (event, folderPath) => {
    console.log('Received request to list folder contents:', folderPath);
    listFolderContents(event, folderPath);
});
ipcMain.on('chooseExportFolder', (event) => {
    openFolderDialog(event, (selectedFolder) => {
        returnPath(event, selectedFolder);
    });
});
ipcMain.on('chooseEditFolder', (event) => {
    openFolderDialog(event, (selectedFolder) => {
        listFolderContents(event, selectedFolder);
    });
});

ipcMain.on('listFolders', (event, folderPath) => {
    console.log('Received request to list folders:', folderPath);
    listFolders(event, folderPath);
});

function returnPath(event, folderPath) {
    try {
        event.reply('exportPath', folderPath);
    }
    catch (error) {
        console.error('Error listing folder contents:', error);
    }
}

function listFolderContents(event, folderPath) {
    try {
        console.log('Listing folder contents:', folderPath);


        const directories = listContentsRecursively(folderPath);

        const filteredTree = dirTree(folderPath);

        console.log('Directories:', directories);
        // console.log('filteredTree:', filteredTree);
        event.reply('folderContents', directories);
    } catch (error) {
        console.error('Error listing folder contents:', error);
        event.reply('folderContentsError', error.message);
    }
}
function listContentsRecursively(folderPath) {
    try {
        const contents = fse.readdirSync(folderPath);
        let directories = [];

        contents.forEach((item) => {
            const fullPath = path.join(folderPath, item);
            const stats = fse.statSync(fullPath);
            const isDirectory = stats.isDirectory();
            if (isDirectory) {
                const entry = {
                    name: item,
                    path: fullPath,
                    isDirectory: isDirectory,
                    newName: '',
                };

                directories.push(entry);

                // Recursively list contents for subdirectories
                const subDirectories = listContentsRecursively(fullPath);
                directories = directories.concat(subDirectories);
            }
        });

        return directories;
    } catch (error) {
        console.error('Error listing folder contents:', error);
        throw error;
    }
}

let selectedFolder = null;

function openFolderDialog(event, callback) {
    dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    }).then(result => {
        if (!result.canceled && result.filePaths.length > 0) {
            selectedFolder = result.filePaths[0]; // Assign the selected folder globally
            if (callback && typeof callback === 'function') {
                callback(selectedFolder);
            }
        }
    }).catch(error => {
        event.reply('folderContentsError', error.message);
    });
}
// function openFileDialog(event, callback) {
//     dialog.showOpenDialog(mainWindow, {
//         properties: ['openFile'],
//     }).then(result => {
//         if (!result.canceled && result.filePaths.length > 0) {
//             selectedFolder = result.filePaths[0]; // Assign the selected folder globally
//             if (callback && typeof callback === 'function') {
//                 callback(selectedFolder);
//             }
//         }
//     }).catch(error => {
//         event.reply('folderContentsError', error.message);
//     });
// }
module.exports = { createWindow, listFolderContents };
