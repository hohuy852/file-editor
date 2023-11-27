// src/main-process/mainProcessModule.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fse = require('fs-extra');


function createEdit() {
    mainWindow = new BrowserWindow({
        resizable:false,
        width: 400,
        height: 300,
        // autoHideMenuBar: true,
        minimizable: false,
        maximizable: false,
        skipTaskbar: true,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, '../../renderer/preloads/Edit.js'),
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
function HandleCreateEdit(mainWindow) {
    ipcMain.on('handleEditDialog', (event) => {
        createEdit()
    });
    ipcMain.on('testfunction', (event) => {
        mainWindow.webContents.send('smallWindow');
    });

}

module.exports = { HandleCreateEdit };