// src/main-process/mainProcessModule.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

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

ipcMain.on('getFolderContents', (event, folderPath) => {
    console.log('Received request to list folder contents:', folderPath);
    listFolderContents(event, folderPath);
});

ipcMain.on('openFolderDialog', (event) => {
    openFolderDialog(event);
});

ipcMain.on('listFolders', (event, folderPath) => {
    console.log('Received request to list folders:', folderPath);
    listFolders(event, folderPath);
});

function listFolderContents(event, folderPath) {
    try {
        console.log('Listing folder contents:', folderPath);
        const directories = listContentsRecursively(folderPath);

        console.log('Directories:', directories);
        event.reply('folderContents', directories);
    } catch (error) {
        console.error('Error listing folder contents:', error);
        event.reply('folderContentsError', error.message);
    }
}

function listContentsRecursively(folderPath) {
    const contents = fs.readdirSync(folderPath);
    let directories = [];

    contents.forEach((item) => {
        const fullPath = path.join(folderPath, item);
        const stats = fs.statSync(fullPath);
        const isDirectory = stats.isDirectory();

        if (isDirectory) {
            const entry = {
                name: item,
                path: fullPath,
                isDirectory: isDirectory,
                size: null,
                extension: null
            };

            directories.push(entry);

            // Recursively list contents for subdirectories
            const subDirectories = listContentsRecursively(fullPath);
            directories = directories.concat(subDirectories);
        }
    });

    return directories;
}


function openFolderDialog(event) {
    dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    }).then(result => {
        if (!result.canceled && result.filePaths.length > 0) {
            const selectedFolder = result.filePaths[0];
            listFolderContents(event, selectedFolder);
            console.log('Selected folder:', selectedFolder);
        }
    }).catch(error => {
        event.reply('folderContentsError', error.message);
    });
}

module.exports = { createWindow, listFolderContents };
