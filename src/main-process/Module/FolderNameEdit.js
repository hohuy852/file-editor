// src/main-process/mainProcessModule.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fse = require('fs-extra');


function createEdit() {
    mainWindow = new BrowserWindow({
        resizable:false,
        width: 400,
        height: 300,
        autoHideMenuBar: true,
        minimizable: false,
        maximizable: false,
        skipTaskbar: true,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, '../../renderer/components/Edit.js'),
            enableRemoteModule: true,
        }

    });
    const indexPath = path.join(__dirname, '../../edit.html');
    mainWindow.loadFile(indexPath);
    // Set mainWindow to null when the window is closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    return mainWindow; // Return the created window
}
function HandleCreateEdit() {
    ipcMain.on('handleEditDialog', (event) => {
        createEdit()
    });
    ipcMain.on('testfunction', (event, newName) => {
        replaceLastDirectoryName('D:/renamed/taba', newName)
    });

    function replaceLastDirectoryName(folderPath, replaceString) {
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

module.exports = { HandleCreateEdit };