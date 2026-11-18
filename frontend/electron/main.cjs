const { app, BrowserWindow, protocol, net } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

protocol.registerSchemesAsPrivileged([
  { scheme: 'iitsm', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } },
]);

const webRoot = path.resolve(__dirname, '..', 'dist');
let mainWindow;

async function startApp() {
  await app.whenReady();
  protocol.handle('iitsm', async (request) => {
    let relativePath;
    try {
      relativePath = decodeURIComponent(new URL(request.url).pathname).replace(/^[/\\]+/, '');
    } catch {
      return new Response('Not found', { status: 404 });
    }
    let filePath = path.resolve(webRoot, relativePath || 'index.html');
    if (filePath !== webRoot && !filePath.startsWith(`${webRoot}${path.sep}`)) {
      return new Response('Not found', { status: 404 });
    }
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) filePath = path.join(webRoot, 'index.html');
    return net.fetch(pathToFileURL(filePath).toString());
  });

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 920,
    minHeight: 640,
    backgroundColor: '#0f172a',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  const devServer = process.argv.includes('--dev') ? 'http://127.0.0.1:5173' : null;
  await mainWindow.loadURL(devServer || 'iitsm://app/index.html');
}

startApp();

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
