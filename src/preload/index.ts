import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

export type EchoProcessChannel = 
  | 'echo-server:info'
  | 'echo-server:launch'
  | 'echo-server:launched'
  | 'echo-server:launch-failed'
  | 'echo-server:destroy'
  | 'echo-server:destroyed'

export const echoProcessChannels: EchoProcessChannel[] = [
  'echo-server:info',
  'echo-server:launch',
  'echo-server:launched',
  'echo-server:launch-failed',
  'echo-server:destroy',
  'echo-server:destroyed'
];

// Custom APIs for renderer
const api = {
  send: (channel: EchoProcessChannel, ...args): void => {
    if (!echoProcessChannels.includes(channel)) {
      throw new Error(`Invalid send channel: ${channel}`)
    }

    ipcRenderer.send(channel, ...args)
  },
  receive: (channel: EchoProcessChannel, callback): (() => Electron.IpcRenderer) => {
    if (!echoProcessChannels.includes(channel)) {
      throw new Error(`Invalid receive channel: ${channel}`)
    }

    const subscription = (event, ...args): (() => void) => callback(event, ...args)

    ipcRenderer.on(channel, subscription)

    return () => ipcRenderer.removeListener(channel, subscription)
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
