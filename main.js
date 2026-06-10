const { app, BrowserWindow, Menu, session } = require('electron');
const path = require('path');
const fs   = require('fs');

let mainWindow;

// ── GERADOR DE IMAGENS DE FUNDO ──
// Cria bg-sim.jpg, bg-rev.jpg e bg-hist.jpg na primeira execução.
async function ensureBackgrounds() {
  const assetsDir = path.join(__dirname, 'assets');
  if (!fs.existsSync(assetsDir)) {
    try { fs.mkdirSync(assetsDir, { recursive: true }); } catch (e) { return; }
  }
  const scenes = ['sim', 'rev', 'hist'];
  const missing = scenes.filter(s => !fs.existsSync(path.join(assetsDir, `bg-${s}.jpg`)));
  if (!missing.length) return;

  const genWin = new BrowserWindow({
    width: 1100, height: 800, show: false, frame: false,
    webPreferences: { nodeIntegration: false, contextIsolation: false, webSecurity: false }
  });
  genWin.webContents.on('did-fail-load', () => {}); // silencia erros da janela oculta

  // Carrega a página uma única vez; troca de cena via executeJavaScript
  try { await genWin.loadFile(path.join(__dirname, 'src', 'gen-bg.html')); }
  catch (e) { console.error('[bg-gen] falha ao carregar gen-bg.html:', e.message); genWin.destroy(); return; }
  await new Promise(r => setTimeout(r, 600));

  for (const scene of missing) {
    try {
      console.log(`[bg-gen] gerando bg-${scene}.jpg...`);
      // Renderiza o SVG via canvas no renderer — evita o bug de display surface
      const dataUrl = await genWin.webContents.executeJavaScript(`
        new Promise(function(resolve, reject) {
          var sc = ${JSON.stringify(scene)};
          // Ativa a cena correta
          document.querySelectorAll('svg.scene').forEach(function(s){ s.style.display='none'; });
          var svgEl = document.getElementById('bg-' + sc);
          if (!svgEl) { reject(new Error('SVG não encontrado: ' + sc)); return; }
          svgEl.style.display = 'block';
          svgEl.setAttribute('width', '1100');
          svgEl.setAttribute('height', '800');
          var svgStr = new XMLSerializer().serializeToString(svgEl);
          var blob = new Blob([svgStr], {type: 'image/svg+xml;charset=utf-8'});
          var url = URL.createObjectURL(blob);
          var img = new Image(1100, 800);
          img.onload = function() {
            var cv = document.createElement('canvas');
            cv.width = 1100; cv.height = 800;
            cv.getContext('2d').drawImage(img, 0, 0, 1100, 800);
            URL.revokeObjectURL(url);
            resolve(cv.toDataURL('image/jpeg', 0.88));
          };
          img.onerror = function() { URL.revokeObjectURL(url); reject(new Error('falha ao carregar SVG como imagem')); };
          img.src = url;
        })
      `);
      if (!dataUrl || !dataUrl.startsWith('data:')) throw new Error('dataUrl inválida');
      const base64 = dataUrl.split(',')[1];
      if (!base64) throw new Error('base64 vazio');
      const buf = Buffer.from(base64, 'base64');
      if (buf.length < 500) throw new Error(`JPEG muito pequeno: ${buf.length} bytes`);
      fs.writeFileSync(path.join(assetsDir, `bg-${scene}.jpg`), buf);
      console.log(`[bg-gen] bg-${scene}.jpg salvo (${buf.length} bytes)`);
    } catch (e) { console.error(`[bg-gen] erro bg-${scene}:`, e.message); }
  }
  try { genWin.destroy(); } catch (e) {}
}

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

app.whenReady().then(async () => {
  await ensureBackgrounds();
  createWindow();
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (mainWindow === null) createWindow(); });
