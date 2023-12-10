// src/main-process/mainProcessModule.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fse = require('fs-extra');

function createEdit() {
    editWindow = new BrowserWindow({
        resizable: false,
        modal:true,
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
    editWindow.loadFile(indexPath);
    // Set mainWindow to null when the window is closed
    editWindow.on('closed', () => {
        editWindow = null;
    });
    return editWindow; // Return the created window
}
function HandleCreateEdit() {
    ipcMain.on('handleEditDialog', (event) => {
        createEdit()
    });
}

module.exports = { HandleCreateEdit };