const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const system_extension = require('../../src');

const identifier = process.env.EXT_IDENTIFIER;
if (!identifier) {
  console.error('Usage: EXT_IDENTIFIER=<yourid>', process.argv[1]);
  process.exit(-1);
}

console.log('basic: imported module:', system_extension);
function _eventHandler(reason, ident, result) {
  console.log('basic: _eventHandler:', reason, ident, result);
}
system_extension.setDebug(true);

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
};

app.whenReady().then(() => {
  console.log('basic: trying to install:', identifier);
  const ret = system_extension.install(identifier, _eventHandler);
  console.log('basic: install ret:', ret);

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
