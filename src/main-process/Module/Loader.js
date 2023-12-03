// src/main-process/mainProcessModule.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fse = require('fs-extra');


function createLoader() {
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
            preload: path.join(__dirname, '../../renderer/preloads/Loader.js'),
            enableRemoteModule: true,
        }

    });
    const indexPath = path.join(__dirname, '../../loader.html');
    mainWindow.loadFile(indexPath);
    // Set mainWindow to null when the window is closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    return mainWindow; // Return the created window
}
function HandleCreateLoader(mainWindow) {
    ipcMain.on('handleLoaderDialog', (event) => {
        createLoader()
    });
}

module.exports = { HandleCreateLoader };