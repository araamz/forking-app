import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  createEchoServerProcesses: (host: string, port: number, message: string): void =>
    ipcRenderer.send('echo-server:create', host, port, message),
  destroyEchoServerProcesses: (pid: number): void => ipcRenderer.send('echo-server:destroy', pid),
  updateEchoServerProcesses: (pid: number, message: string): void =>
    ipcRenderer.send('echo-server:update', pid, message),
  onEchoServerInfo: (callback): () => Electron.IpcRenderer => {
    const subscription: (e, pid, host, port, message) => Electron.IpcRenderer = (
      e: Electron.IpcRendererEvent,
      pid: number,
      host: string,
      port: number,
      message: string
    ) => callback(e, pid, host, port, message)

    ipcRenderer.on('echo-server:success', subscription)
    return () => ipcRenderer.removeListener('echo-server:success', subscription)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
