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
    } catch (error) {
        console.error('Error listing folder contents:', error);
        throw error;
    }
}

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

module.exports = { createWindow, listFolderContents };
