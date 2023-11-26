// src/main-process/mainProcessModule.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');


function createEdit() {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 300,
        autoHideMenuBar: true,
        minimizable: false,
        maximizable: false,
        modal: true,
        show: false,
        skipTaskbar: true,
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
function HandleCreateEdit (){

    ipcMain.on('handleEditDialog', (event) => {
        createEdit()
    });

    ipcMain.on('testfunction', (event) => {
        console.log("redsdas")
    });

}
module.exports = { HandleCreateEdit };