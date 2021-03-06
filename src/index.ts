import { app, BrowserWindow, ipcRenderer, dialog, ipcMain } from "electron";
import { FsOperations } from "./fsOperations";
declare const MAIN_WINDOW_WEBPACK_ENTRY: any;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const unhandled = require('electron-unhandled');

unhandled();


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

const saveWindowSize = (fsOperations: FsOperations, size: any) => {
  fsOperations.set(size);
}

const createWindow = (): void => {
  let fsoperations = new FsOperations({
    defaults: {
      height: 600,
      width: 300,
      x: undefined,
      y: undefined
    },
    fileName: "windowPreferences.json",
  });

  fsoperations.get(true).then((value: any) => {
    const constructionOptions: Electron.BrowserWindowConstructorOptions = {
      width: value.width,
      height: value.height,
      x: value.x,
      y: value.y,
      minWidth: 300,
      minHeight: 400,
      // maxWidth: 500,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: true,
        webSecurity: false
      }
    };

    const mainWindow = new BrowserWindow(constructionOptions);

    mainWindow.on("close", async () => {
      const windowBounds = mainWindow.getBounds();
      await fsoperations.set(windowBounds);
    });

    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  });
};


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.


// Creates a file dialogto open a json file | DOC: https://www.electronjs.org/docs/api/dialog

ipcMain.on('open-file-dialog-for-file', (event) => {
  if (process.platform === 'linux' || process.platform === 'win32') {
    dialog.showOpenDialog({
      filters: [{ name: "NoteFiles", extensions: ["json"] }],
      properties: ['openFile']
    }).then((files: any) => {

      if (files) {
        if (!files.canceled) {
          event.sender.send('selected-file', files.filePaths[0]);
        } else {
          event.sender.send('selected-file', undefined);
        }
      }

    });
  } else {
    dialog.showOpenDialog({
      filters: [{ name: "NoteFiles", extensions: ["json"] }],
      properties: ['openFile', 'openDirectory']
    }).then((files: any) => {
      
      if (files) {
        if (!files.canceled) {
          event.sender.send('selected-file', files.filePaths[0]);
        } else {
          event.sender.send('selected-file', undefined);
        }
      }

    });
  }
});