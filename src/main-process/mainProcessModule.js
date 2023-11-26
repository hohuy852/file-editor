// src/main-process/mainProcessModule.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const { HandleCreateEdit } = require('./Module/FolderNameEditModule');

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
function createEdit() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, '../renderer/components/Edit.js'),
            enableRemoteModule: true,
        }
        
    });
    const indexPath = path.join(__dirname, '../edit.html');
    mainWindow.loadFile(indexPath);

    // Set mainWindow to null when the window is closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    return mainWindow; // Return the created window
}

HandleCreateEdit()

ipcMain.on('handleEditDialog', (event) => {
    createEdit()
});

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

let selectedFolder

function openFolderDialog(event) {
    dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    }).then(result => {
        if (!result.canceled && result.filePaths.length > 0) {
            selectedFolder = result.filePaths[0]; // Assign the selected folder globally
            listFolderContents(event, selectedFolder);
        }
    }).catch(error => {
        event.reply('folderContentsError', error.message);
    });
}

function replaceDirectoryNames(folderPath, replaceString) {
    try {
        const contents = fs.readdirSync(folderPath);
        contents.forEach((item) => {
            const fullPath = path.join(folderPath, item);
            const stats = fs.statSync(fullPath);
            const isDirectory = stats.isDirectory();

            if (isDirectory) {
                const renamedPath = path.join(folderPath, item.replace(item, replaceString));
                fs.renameSync(fullPath, renamedPath);

                // Recursively replace contents for subdirectories
                replaceDirectoryNames(renamedPath, replaceString);
            }
        });
        console.log('Directory names replaced successfully.');
    } catch (error) {
        console.error('Error replacing directory names:', error);
    }
}


module.exports = { createWindow, listFolderContents };
