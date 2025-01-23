import { app, shell, BrowserWindow, ipcMain, ipcRenderer } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { exec, spawn } from 'child_process' 

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true
    }
  })

  const processWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  processWindow.on('ready-to-show', () => {
    processWindow.show()
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  processWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    console.log("PROCESS WINDOW", join(process.env['ELECTRON_RENDERER_URL'], '/43432'))
    processWindow.loadURL(join(process.env['ELECTRON_RENDERER_URL'], '/43432'))
    console.log("PROCESS WINDOW: URL", processWindow.webContents.getURL())
  } else {
    processWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }

})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
function createEchoServerProcesses(event, host, port, message): void {
  const instance = spawn('./src/processes/echo_server/echo_server', [host, port, message])

  const webCotnents = event.sender;
  const window = BrowserWindow.fromWebContents(webCotnents)

  instance.on('error', (err) => {
    console.error(`Failed to start subprocess. ${err}`)
  })

  instance.on('spawn', () => {
    console.log(`Echo server started with pid: ${instance.pid}`)
    webCotnents.send('echo-server:info', 'test')
    event.reply('echo-server:success', {
      pid: instance.pid,
      host,
      port,
      message
    })
  })
}

// Event listener for creating echo server processes
ipcMain.on('echo-server:create', createEchoServerProcesses)
