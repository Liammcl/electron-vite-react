import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import { update } from './update'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win= null
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

async function createWindow() {
  win = new BrowserWindow({
    title: 'Uppeta Cam',
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    width: 1200,
    height: 800,
    webPreferences: {
      preload,
      nodeIntegration: true,
      webSecurity: true,
    },
  })

  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:;",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval';",
          "worker-src 'self' blob: data:;",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
          "font-src 'self' https://fonts.gstatic.com;",
          "img-src 'self' data: blob: *;",
          "media-src 'self' data: blob: mediastream:;",
          "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com;"
        ].join(' ')
      }
    });
  });

  if (VITE_DEV_SERVER_URL) { // #298
    console.log(VITE_DEV_SERVER_URL,'VITE_DEV_SERVER_URL');
    
    win.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    console.log(indexHtml,'indexHtml');
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  // Auto update
  update(win)
}

app.whenReady().then(() => {
  if (process.env.NODE_ENV === 'development') {
    app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
      event.preventDefault();
      callback(true);
    });
  }
  
  createWindow();
});

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    console.log(VITE_DEV_SERVER_URL,'111')
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    console.log(indexHtml,'222')
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})
