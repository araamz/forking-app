import BarButton from '@renderer/components/ActionButton'
import InputForm from '@renderer/components/InputForm'
import Title from '@renderer/components/Title'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function EchoServerView(): ReactElement {
  const echoProcessAPI = window.api
  const echoServerInfoChannel = 'echo-server:info'
  const echoServerDestroyChannel = 'echo-server:destroy'
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const { pid } = useParams()

  const [host, setHost] = useState<string>('')
  const [port, setPort] = useState<number>(0)
  const [message, setMessage] = useState<string>('')
  const [savedMessage, setSavedMessage] = useState<string>('')
  const [messageTimestamp, setMessageTimestamp] = useState<string>('')

  const updateMessage = useCallback(async () => {
    const controller = new AbortController()
    const { signal } = controller
    await fetch(`http://${host}:${port}/update`, {
      method: 'POST',
      signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message.trim()
      })
    })
      .then((response) => {
        if (response.ok) return response.json()
        throw new Error('Failed to update message to Echo Server.')
      })
      .then((data) => {
        console.log('Updated Message: ', data)
        setMessage(data.message)
        setMessageTimestamp(data.changed)
        setSavedMessage(data.message)
        setIsLoading(false)
      })
      .catch((error) => {
        setError(error)
      })

    return () => {
      return (): void => {
        controller.abort()
      }
    }
  }, [message, host, port])

  const requestMessage = useCallback(async () => {
    if (!host === undefined) return
    const controller = new AbortController()
    const { signal } = controller
    await fetch(`http://${host}:${port}/`, {
      method: 'GET',
      signal
    })
      .then((response) => {
        if (response.ok) return response.json()
        throw new Error('Failed to connect to Echo Server.')
      })
      .then((data) => {
        setMessage(data.message)
        setMessageTimestamp(data.changed)
        setSavedMessage(data.message)
        setIsLoading(false)
      })
      .catch((error) => {
        setError(error)
      })

    return () => {
      return (): void => {
        controller.abort()
      }
    }
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
    })

    return (): void => removeListener()
  }, [setHost, setPort])

  useEffect(() => {
    if (host && port) {
      requestMessage()
    }
  }, [host, port, requestMessage])

  const endProcessServer = () => {
    echoProcessAPI.send(echoServerDestroyChannel, pid)
  }

  const humanTimestamp = new Date(messageTimestamp).toLocaleString()

  return (
    <div className="w-screen h-screen bg-gray-100 p-4 flex flex-col gap-4">
      <Title label={`Process ${pid}`} />
      {!isLoading && (
        <>
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
              <InputForm
                value={message}
                onChange={handleMessageChange}
                type="text"
                placeholder="Hello, World"
              />
            </label>
            <p className="text-sm text-gray-400">Last Updated: {humanTimestamp}</p>
          </div>
          <div className="flex flex-row gap-4">
            <BarButton
              onClick={() => updateMessage()}
              disabled={message === savedMessage || message.trim() === ''}
            >
              Update
            </BarButton>
            <BarButton onClick={() => endProcessServer()}>End Process</BarButton>
          </div>{' '}
        </>
      )}
    </div>
  )
}
