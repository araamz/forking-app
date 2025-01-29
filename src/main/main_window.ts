import icon from '../../resources/icon.png?asset'
import { shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import createProcessWindow from './process_window'
import { windows } from '.'

function createMainWindow(route: string): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    title: 'Echo Server Creator',
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(join(process.env['ELECTRON_RENDERER_URL'], route))
  } else {
    const buildLocation = `file://${join(__dirname, `../renderer/index.html#/${route}`)}`
    mainWindow.loadURL(buildLocation)
  }

  return mainWindow
}

ipcMain.on('main-maindow:open-process-viewer', (_event, processObject) =>
  windows.push({
    instance: createProcessWindow(`/process/`, processObject.pid),
    type: 'process',
    label: processObject.pid
  })
)

export default createMainWindow
