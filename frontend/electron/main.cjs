const { app, BrowserWindow, protocol, net } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'iitsm',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
]);

const webRoot = path.resolve(__dirname, '..', 'dist');
let mainWindow;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.webp': 'image/webp',
};

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
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      filePath = path.join(webRoot, 'index.html');
    }

    try {
      const ext = path.extname(filePath).toLowerCase();
      const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
      const fileBuffer = fs.readFileSync(filePath);
      return new Response(fileBuffer, {
        headers: {
          'Content-Type': mimeType,
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (e) {
      return net.fetch(pathToFileURL(filePath).toString());
    }
  });

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 920,
    minHeight: 640,
    backgroundColor: '#0f172a',
    title: 'I-ITSM HelpDesk',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false,
    },
  });
  const devServer = process.argv.includes('--dev') ? 'http://127.0.0.1:5173' : null;
  await mainWindow.loadURL(devServer || 'iitsm://app/index.html');
}

startApp();

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
