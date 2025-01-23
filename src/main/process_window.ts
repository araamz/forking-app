import icon from '../../resources/icon.png?asset'
import { shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

function createProcessWindow(pid: string): void {
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

  processWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  const processRoute = `/${pid}`
  const processWindowURL =
    is.dev && process.env['ELECTRON_RENDERER_URL']
      ? join(process.env['ELECTRON_RENDERER_URL'], processRoute)
      : processRoute
  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    processWindow.loadURL(processWindowURL)
  } else {
    processWindow.loadFile(join(__dirname, '../renderer/index.html'))
    processWindow.loadURL(processWindowURL)
  }
}

function createEchoServerProcesses(event, host, port, message): void {
  const instance = spawn('./src/processes/echo_server/echo_server', [host, port, message])

  const webCotnents = event.sender
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

export default createProcessWindow
