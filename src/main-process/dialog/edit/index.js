const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');


let editDialog;
function createEditDialog() {
    const customDialogPath = path.join(__dirname, 'edit.html');

    const dialogOptions = {
        width: 400,
        height: 300,
        show: false,
        webPreferences: {
            nodeIntegration: true
        },
        
    };

    if (!customDialogWindow) {
        customDialogWindow = new BrowserWindow(dialogOptions);

        customDialogWindow.loadFile(customDialogPath);

        customDialogWindow.once('ready-to-show', () => {
            customDialogWindow.show();
        });

        customDialogWindow.on('closed', () => {
            customDialogWindow = null;
        });
    } else {
        customDialogWindow.show();
    }
}

module.exports = { createEditDialog };