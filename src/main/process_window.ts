import icon from '../../resources/icon.png?asset'
import { shell, BrowserWindow, ipcMain, ipcRenderer } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { spawn } from 'child_process'

function createProcessWindow(route: string, pid: string): void {
  const processWindow = new BrowserWindow({
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

  processWindow.on('ready-to-show', () => {
    processWindow.show()
  })

  processWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  const processRoute = `process/${pid}`
  const processWindowURL =
    is.dev && process.env['ELECTRON_RENDERER_URL']
      ? join(process.env['ELECTRON_RENDERER_URL'], processRoute)
      : processRoute
  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    processWindow.loadURL(processWindowURL)
  } else {
    const buildLocation = `file://${join(__dirname, `../renderer/index.html#/${route}/${pid}`)}`
    processWindow.loadURL(buildLocation)
  }
}

function createEchoServerProcesses(event, host, port, message): void {
  const instance = spawn('./src/processes/echo_server/echo_server', [host, port, message])

  const webContents = event.sender

  instance.on('error', (err) => {
    console.error(`Failed to start subprocess. ${err}`)
  })

  instance.on('spawn', () => {
    console.log(`Echo server started with host: ${host}, port: ${port}, message: ${message}`)
    console.log(`Echo server started with pid: ${instance.pid}`)
    webContents.send('echo-server:info', 'test')
    event.reply('echo-server:success', instance.pid, message)
  })
}

// Event listener for creating echo server processes
ipcMain.on('echo-server:create', createEchoServerProcesses)

export default createProcessWindow