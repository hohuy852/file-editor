// src/main-process/mainProcessModule.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fse = require('fs-extra').promises;
const path = require('path');
const { HandleCreateEdit } = require('./Module/FolderNameEdit');
const dirTree = require("directory-tree");


let mainWindow;
let loadWindow;
app.disableHardwareAcceleration();

function createLoader() {
    loadWindow = new BrowserWindow({
        parent: mainWindow,
        modal:true,
        autoHideMenuBar:true,
        resizable: false,
        width: 633,
        height: 228,
        minimizable: false,
        maximizable: false,
        skipTaskbar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, '../renderer/preloads/Loader.js'),
            enableRemoteModule: true,
        }

    });
    const indexPath = path.join(__dirname, '../loader.html');
    loadWindow.loadFile(indexPath);
    loadWindow.on('closed', () => {
        loadWindow = null;
    });
    return loadWindow; // Return the created window
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, '../renderer/preloads/App.js')
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
ipcMain.on('export', (event) => {
    openSaveDialog(event)
})

ipcMain.on('changeName', (event, name) => {
    mainWindow.webContents.send('changeFolderName', name);
});

ipcMain.on('getFolderContents', (event, folderPath) => {
    listFolder(event, folderPath);
});

ipcMain.on('listFile', (event) => {
    openFolderDialog(event, (selectedFolder) => {
        listFile(event, selectedFolder);
    });
});

ipcMain.on('listFolder', (event) => {
    openFolderDialog(event, (selectedFolder) => {
        listFolder(event, selectedFolder);
    });
});

ipcMain.on('listFolders', (event, folderPath) => {
    console.log('Received request to list folders:', folderPath);
    listFolder(event, folderPath);
});
ipcMain.on('openFile', (event) => {
    openFileDialog(event)
})

function loadedSuccess(){
    loadWindow.webContents.send('loadedSuccess', 'Đã hoàn tất');
}
async function listFolder(event, folderPath) {
    try {
        // createLoader();
        const directories = await listFolderRecursively(folderPath, event);
        event.reply('folderContents', directories);
        loadedSuccess()

    } catch (error) {
        console.error('Error listing folder contents:', error);
        event.reply('folderContentsError', error.message);
    }
}
async function listFile(event, folderPath) {
    try {
        createLoader();
        const files = await listFilesRecursively(folderPath, event);
        event.reply('filesList', files);
        loadedSuccess()
    } catch (error) {
        console.error('Error listing folder contents:', error);
        event.reply('filesListError', error.message);

    }
}

async function listFilesRecursively(folderPath) {
    try {
        const startTime = Date.now(); // Start the timer when the function is called
        const contents = await fse.readdir(folderPath);
        let files = [];
        let totalFiles = contents.length;

        for (const [i, item] of contents.entries()) {
            const fullPath = path.join(folderPath, item);
            const stats = await fse.stat(fullPath);
            const isDirectory = stats.isDirectory();

            if (!isDirectory) {
                const extension = path.extname(item).slice(1);

                const entry = {
                    name: item,
                    path: fullPath,
                    extension: extension,
                };

                files.push(entry);
            } else {
                // Recursively list contents for subdirectories
                const subFiles = await listFilesRecursively(fullPath);
                files = files.concat(subFiles);
            }

            // Send progress update to the renderer process
            const progress = {
                folderPath: fullPath,
                percent: Math.round(((i + 1) / totalFiles) * 100),
            };
            if (loadWindow) {
                loadWindow.webContents.send('progressUpdate', progress);
            }
        }

        return files;
    } catch (error) {
        console.error('Error listing folder contents:', error);
        throw error;
    }
}


async function listFolderRecursively(folderPath, event, totalItems = 0, processedItems = 0) {
    try {
        const contents = await fse.readdir(folderPath, { withFileTypes: true });
        let directories = [];

        totalItems += contents.length;

        for (const [i, item] of contents.entries()) {
            const fullPath = path.join(folderPath, item.name);

            if (item.isDirectory()) {
                const entry = {
                    name: item.name,
                    path: fullPath,
                    isDirectory: true,
                    newName: '',
                };

                directories.push(entry);

                // Recursively list contents for subdirectories
                const subDirectories = await listFolderRecursively(fullPath, event, totalItems, processedItems);
                directories = directories.concat(subDirectories);

                processedItems++;

                const percent = (processedItems / totalItems) * 100;
                const progress = {
                    folderPath: fullPath,
                    percent: percent.toFixed(2),
                };
                if (loadWindow) {
                    loadWindow.webContents.send('progressUpdate', progress);
                }
            }
        }

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

let selectedFile = null;

function openFileDialog(event, callback) {
    dialog.showOpenDialog(mainWindow, {
        properties: ['openFile']
    })
        .then(result => {
            if (result.canceled) {
                // User canceled the dialog
                event.reply('openDialogCanceled');
            } else if (result.filePaths.length > 0) {
                selectedFile = result.filePaths[0]; // Assign the selected file globally
                event.reply('selectedFile', selectedFile);
            }
        })
        .catch(error => {
            console.error('Error listing folder contents:', error);
            throw error;
        });
}

function openSaveDialog(event) {
    dialog.showSaveDialog({
        title: 'Select the File Path to save',
        defaultPath: path.join(__dirname, '../assets/sample.xlsx'),
        buttonLabel: 'Save',
        filters: [
            {
                name: 'Excel File',
                extensions: ['xlsx']
            },
        ],
        properties: []
    }).then(file => {
        if (!file.canceled) {
            event.reply('savePath', file.filePath.toString())
            return file.filePath.toString();
        }
        return null;
    }).catch(err => {
        console.log(err);
        return null;
    });
}
module.exports = { createWindow, listFolder, mainWindow };
