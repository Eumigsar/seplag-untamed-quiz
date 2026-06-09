const { app, BrowserWindow, Menu, session } = require('electron');
const path = require('path');

let mainWindow;

app.commandLine.appendSwitch('disable-web-security');
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Simulado SEPLAG-RJ · 陈情令',
    backgroundColor: '#07050a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false,
      webSecurity: false,
      allowRunningInsecureContent: true
    },
    autoHideMenuBar: true,
    show: false
  });

  mainWindow.loadFile('src/index.html');

  mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
    callback({ requestHeaders: { ...details.requestHeaders, 'Origin': '*' } });
  });

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Access-Control-Allow-Origin': ['*'],
        'Access-Control-Allow-Headers': ['*'],
      }
    });
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => { mainWindow = null; });

  const menuTemplate = [
    {
      label: 'Simulado',
      submenu: [
        { label: 'Novo simulado', accelerator: 'CmdOrCtrl+N', click: () => mainWindow.webContents.executeJavaScript('if(typeof voltarCfg==="function")voltarCfg()') },
        { type: 'separator' },
        { label: 'Sair', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
      ]
    },
    {
      label: 'Exibir',
      submenu: [
        { label: 'Tela cheia', accelerator: 'F11', click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen()) },
        { label: 'Zoom +', accelerator: 'CmdOrCtrl+Plus', click: () => mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() + 0.5) },
        { label: 'Zoom -', accelerator: 'CmdOrCtrl+-', click: () => mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() - 0.5) },
        { label: 'Zoom padrão', accelerator: 'CmdOrCtrl+0', click: () => mainWindow.webContents.setZoomLevel(0) }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (mainWindow === null) createWindow(); });
