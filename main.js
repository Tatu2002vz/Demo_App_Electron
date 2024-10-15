const { app, BrowserWindow } = require("electron/main");
require("electron-reload")(__dirname);
if (require("electron-squirrel-startup")) {
  app.quit();
}
function createWindow() {
  const win = new BrowserWindow({
    autoHideMenuBar: true,
    width: 800,
    height: 600,
    icon: __dirname + "/assets/img/icon.ico",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  // win.webContents.openDevTools();
  win.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();
});
// app.on("ready", createWindow);

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
