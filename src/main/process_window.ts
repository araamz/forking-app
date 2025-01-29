import icon from '../../resources/icon.png?asset'
import { shell, BrowserWindow, ipcMain, app } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { ChildProcess, spawn } from 'child_process'
import { windows } from '.'

const echoServers: Record<
  number,
  {
    instance: ChildProcess
    host: string
    port: number
  }
> = {}

function createProcessWindow(route: string, pid: string): BrowserWindow {
  const processWindow = new BrowserWindow({
    width: 500,
    height: 370,
    show: false,
    resizable: false,
    title: `Process ${pid}`,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
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

  return processWindow
}

function createEchoServerProcesses(event, host, port, message): void {
  const aarch64_apple_darwin = './src/processes/echo_server/echo_server_aarch64-apple-darwin'
  const instance = spawn(aarch64_apple_darwin, [host, port, message])

  instance.on('error', (err) => {
    console.error(`Failed to start subprocess. ${err}`)
    event.reply('echo-server:launch-failed', err.message)
  })

  instance.on('spawn', () => {
    if (instance.pid === undefined) {
      event.reply('echo-server:launch-failed', 'Failed to get pid')
      throw new Error('Failed to get pid')
    }
    echoServers[instance.pid] = {
      instance: instance,
      host: host,
      port: port
    }

    console.log(
      `Echo server started with: pid: ${instance.pid}, host: ${host}, port: ${port}, message: ${message}`
    )
    console.log(
      'Echo servers count:',
      Object.entries(echoServers).length,
      Object.entries(echoServers)
    )
    event.reply('echo-server:launched', {
      pid: instance.pid,
      host: host,
      port: port
    })
  })
}

function sendEchoProcessInformation(event, processPID): void {
  console.log(echoServers[processPID])
  const process = echoServers[processPID]

  event.reply('echo-server:info', {
    pid: processPID,
    host: process.host,
    port: process.port
  })
}

function destoryEchoProcess(event, processPID): void {
  const window = BrowserWindow.fromId(event.sender.id)
  const process = echoServers[processPID]
  const successfully_killed = process.instance.kill()
  if (successfully_killed && window) {
    window.close()
    const process_window_index = windows.findIndex((windowItem) => windowItem.label === processPID)
    windows.splice(process_window_index, 1)
    const main_window = windows.find((windowItem) => windowItem.type === 'main')
    main_window?.instance.webContents.send('echo-server:destroyed', processPID)
  } else console.error(`Could not find process viewer window for ${processPID}`)
}

function killAllEchoProcesses(): void {
  Object.entries(echoServers).forEach(([_key, value]) => {
    value.instance.kill()
  })
}

// Event listener for creating echo server processes
ipcMain.on('echo-server:launch', createEchoServerProcesses)
ipcMain.on('echo-server:info', sendEchoProcessInformation)
ipcMain.on('echo-server:destroy', destoryEchoProcess)
app.on('quit', killAllEchoProcesses)

export default createProcessWindow
