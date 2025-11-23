/**
 * Electron Main Process - Desktop Application
 * Windows/macOS/Linux executable
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { ApiServer } from '../../src/api/ApiServer';

let mainWindow: BrowserWindow | null = null;
let apiServer: ApiServer | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: 'OmniForge Council - Enterprise Edition',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    autoHideMenuBar: false,
    backgroundColor: '#1a1a1a'
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

const startApiServer = async () => {
  apiServer = new ApiServer({
    port: 3001,
    corsOrigin: '*',
    enableCompression: true,
    enableHelmet: false, // Disable helmet for Electron
    enableRateLimiting: false // No rate limiting for local desktop app
  });

  await apiServer.start();
};

// App lifecycle
app.on('ready', async () => {
  try {
    await startApiServer();
    createWindow();
  } catch (error) {
    console.error('Failed to start application:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', async () => {
  if (apiServer) {
    await apiServer.stop();
  }
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-path', () => {
  return app.getAppPath();
});
