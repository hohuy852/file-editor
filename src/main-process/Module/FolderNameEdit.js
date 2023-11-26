// src/main-process/mainProcessModule.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fse = require('fs-extra');

// contextBridge.exposeInMainWorld('preloadAPI', {
//     sendToPreload2: (data) => {
//         ipcRenderer.sendTo(2, 'message-to-preload2', data);
//     },
// });

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
    // ipcMain.on('handleEditDialog', (event) => {
    //     createEdit()
    // });
    ipcMain.on('testfunction', (event) => {
        console.log("@!#123");
        smallWindow(event, 'sdsd');
    });

    function smallWindow( event, text){
        try {
            event.reply('smallWindow', text);
        }
        catch (error) {
            console.error('Error listing folder contents:', error);
        }
    }
    // replaceLastDirectoryName('D:/renamed/taba', newName)

}

module.exports = { HandleCreateEdit };