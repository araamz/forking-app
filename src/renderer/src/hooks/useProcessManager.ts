import { useEffect, useState } from 'react'

export interface IProcessObject {
  pid: number
  host: string
  port: number
}

export default function useProcessManager(): Array<IProcessObject> {
  const echoProcessAPI = window.api
  const launchedChannel = 'echo-server:launched'
  const destroyedChannel = 'echo-server:destroyed'

  const [pids, setPids] = useState<Array<IProcessObject>>([])

  // Listen to 'launched' channel
  useEffect(() => {
    const processStatus = echoProcessAPI.receive(
      launchedChannel,
      (_event: Electron.IpcRenderer, processObject: IProcessObject) => {
        setPids((prevState: Array<IProcessObject>) => {
          // Check if the process already exists
          if (!prevState.some((item) => item.pid === processObject.pid)) {
            return [...prevState, processObject]
          }
          return prevState
        })
      }
    )

    return (): void => {
      processStatus()
    }
  }, []) // Empty dependency array so it runs only once when the component mounts

  // Listen to 'destroyed' channel
  useEffect(() => {
    const processStatus = echoProcessAPI.receive(
      destroyedChannel,
      (_event: Electron.IpcRenderer, pid: number) => {
        console.log('Process Destroyed:', pid)
        setPids((prevState: Array<IProcessObject>) => {
          return [...prevState.filter((processItem) => String(processItem.pid) !== String(pid))]
        })
      }
    )

    return (): void => {
      console.log('Cleanup destroyedChannel listener')
      processStatus()
    }
  }, []) // Empty dependency array so it runs only once when the component mounts

  return pids
}
