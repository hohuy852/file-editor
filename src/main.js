// src/main.js
const { app } = require('electron');
const { createWindow } = require('./main-process/mainProcessModule');


// Quit the app when all windows are closed
app.whenReady().then(() => {
    createWindow ()
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow ()
    })
  })

// Quit the app when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
