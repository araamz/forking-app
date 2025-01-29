import BarButton from '@renderer/components/ActionButton'
import InputForm from '@renderer/components/InputForm'
import Title from '@renderer/components/Title'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function EchoServerView(): ReactElement {

    const echoProcessAPI = window.api
    const echoServerInfoChannel = 'echo-server:info'
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { pid } = useParams()

  const [host, setHost] = useState<string>('')
  const [port, setPort] = useState<number>(0)
  const [message, setMessage] = useState<string>('')

  const requestMessage = useCallback(() => {
    if (host === undefined) return
    fetch(`http://${host}:${port}/`, {
      method: 'GET'
    }).then((response) => {
      console.log(response)
      if (response.ok) return response.data
    }).then((data) => {
      setMessage(data)
    })
  }, [host, port])

  const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setMessage(event.target.value)
  }

  useEffect(() => {
    echoProcessAPI.send(echoServerInfoChannel, pid)
  }, [])

  useEffect(() => {
    const removeListener = echoProcessAPI.receive(echoServerInfoChannel, (event, processObject) => {
        console.log('UseEffect: processObject', processObject)
        setHost(processObject.host)
        setPort(processObject.port)
        requestMessage()
    })

    return (): void => removeListener()
}, [])

  return (
    <div className="w-screen h-screen bg-gray-100 p-4 flex flex-col gap-4">
      <Title label={`Process ${pid}`} />
      <div className="flex flex-col gap-4 [&>label]:flex [&>label]:items-center [&>label]:gap-2">
        <label>
          Host
          <InputForm value={host} disabled type="text" placeholder="127.0.0.1" />
        </label>
        <label>
          Port
          <InputForm value={port} disabled type="number" placeholder="2000" />
        </label>
        <label>
          Message
          <InputForm onChange={handleMessageChange} type="text" placeholder="Hello, World" />
        </label>
      </div>
      <div>
        <BarButton>
          Update
        </BarButton>
        <BarButton>
          End Process
        </BarButton>
      </div>
    </div>
  )
}
