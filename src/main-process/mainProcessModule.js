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
    mainWindow.webContents.openDevTools();

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
        const filesAndFolders = listContentsRecursively(folderPath);

        console.log('Files and folders:', filesAndFolders);
        event.reply('folderContents', filesAndFolders);
    } catch (error) {
        console.error('Error listing folder contents:', error);
        event.reply('folderContentsError', error.message);
    }
}

function listFolders(event, folderPath) {
    try {
        console.log('Listing folders only:', folderPath);
        const folders = listFoldersRecursively(folderPath);

        console.log('Folders only:', folders);
        event.reply('folderContents', folders);
    } catch (error) {
        console.error('Error listing folders:', error);
        event.reply('folderContentsError', error.message);
    }
}

function listFoldersRecursively(folderPath) {
    const contents = fs.readdirSync(folderPath);
    let folders = [];

    contents.forEach((item) => {
        const fullPath = path.join(folderPath, item);
        const stats = fs.statSync(fullPath);
        const isDirectory = stats.isDirectory();

        if (isDirectory) {
            const entry = {
                name: item,
                path: fullPath,
            };

            folders.push(entry);

            // Recursively list contents for subdirectories
            const subFolders = listFoldersRecursively(fullPath);
            folders = folders.concat(subFolders);
        }
    });

    return folders;
}

function listContentsRecursively(folderPath) {
    const contents = fs.readdirSync(folderPath);
    let filesAndFolders = [];

    contents.forEach((item) => {
        const fullPath = path.join(folderPath, item);
        const stats = fs.statSync(fullPath);
        const isDirectory = stats.isDirectory();

        const entry = {
            name: item,
            path: fullPath,
            isDirectory: isDirectory,
            size: isDirectory ? null : stats.size,
            extension: isDirectory ? null : path.extname(item).toLowerCase().substring(1)
        };

        filesAndFolders.push(entry);

        if (isDirectory) {
            // Recursively list contents for subdirectories
            const subContents = listContentsRecursively(fullPath);
            filesAndFolders = filesAndFolders.concat(subContents);
        }
    });

    return filesAndFolders;
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

module.exports = { createWindow, listFolderContents, listFolders };
