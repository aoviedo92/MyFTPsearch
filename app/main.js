// Module to control application life.
//var app = require('app');
const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
// Module to create native browser window.
//var BrowserWindow = require('browser-window');
var mainWindow = null;

//Make the app single instance
var shouldQuit = app.makeSingleInstance(function () {
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
        mainWindow.show();
        mainWindow.setSkipTaskbar(false);
        if (app.dock && app.dock.show) app.dock.show();
    }
});
if (shouldQuit) {
    app.quit();
    return;
}
// Quit when all windows are closed.
app.on('window-all-closed', function () {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function () {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 900, height: 600, frame: false});
    // and load the index.html of the app.
    mainWindow.loadUrl('file://' + __dirname + '/index.html');
    // Open the devtools.
    //mainWindow.openDevTools();
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

});
