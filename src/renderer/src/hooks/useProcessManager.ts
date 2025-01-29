import { useEffect, useState } from 'react'

export interface IProcessObject {
  pid: number
  host: string
  port: number
}
export default function useProcessManager(): Array<IProcessObject> {
  const echoProcessAPI = window.api
  const launchedChannel = 'echo-server:launched'

  const [pids, setPids] = useState<Array<IProcessObject>>([])

  useEffect(() => {
    const processStatus = echoProcessAPI.receive(
      launchedChannel,
      (_event: Electron.IpcRenderer, processObject) => {
        setPids((prevState: Array<IProcessObject>) => {
          return [...prevState, processObject]
        })
      }
    )

    return (): void => processStatus()
  }, [setPids])

  return pids
}
