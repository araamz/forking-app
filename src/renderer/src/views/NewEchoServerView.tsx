import ActionButton from '@renderer/components/ActionButton'
import InputForm from '@renderer/components/InputForm'
import Title from '@renderer/components/Title'
import { ipcRenderer } from 'electron'
import { ReactElement, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function NewEchoServerView(): ReactElement {
  const [host, setHost] = useState<string>('')
  const [port, setPort] = useState<number>(0)
  const [message, setMessage] = useState<string>('')
  const navigate = useNavigate()

  const echoProcessAPI = window.api

  const handleHostChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setHost(event.target.value)
  }
  const handlePortChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setPort(parseInt(event.target.value))
  }
  const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setMessage(event.target.value)
  }

  const handleCreate = (): void => {
    console.log(echoProcessAPI)
    console.log(`host: ${host}, port: ${port}, message: ${message}`)
    echoProcessAPI.createEchoServerProcesses(host, port, message)
  }

  

  useEffect(() => {
    const ipcCall = echoProcessAPI.onEchoServerInfo((event, pid, message) => {
      console.log("UseEffect: event", event)
      console.log(`UseEffect: pid: ${pid}, message: ${message}`)
    })

    return (): void => {
      ipcCall()
    }
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <Title label="New Echo Server" />
      <div className="flex flex-col gap-4 [&>label]:flex [&>label]:items-center [&>label]:gap-2">
        <label>
          Host
          <InputForm onChange={handleHostChange} type="text" placeholder="127.0.0.1" />
        </label>
        <label>
          Port
          <InputForm onChange={handlePortChange} type="number" placeholder="2000" />
        </label>
        <label>
          Message
          <InputForm onChange={handleMessageChange} type="text" placeholder="Hello, World" />
        </label>
      </div>
      <div className="flex flex-row gap-2">
        <ActionButton onClick={() => handleCreate()}>Create</ActionButton>
      </div>
    </div>
  )
}
