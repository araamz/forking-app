import { Outlet, useNavigate } from 'react-router-dom'
import BarButton from './components/ActionButton'
import ControlBar from './components/ControlBar'
import { MouseEvent } from 'react'
import useProcessManager, { IProcessObject } from './hooks/useProcessManager'

function App(): JSX.Element {

  const openProcessViewerChannel = 'main-maindow:open-process-viewer'
  const echoProcessAPI = window.api
  const pids = useProcessManager()
  const navigate = useNavigate()

  const handleCreate = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault()
    navigate('/main/new')
  }

  const handleProcessViewer = (processObject: IProcessObject): void => {
    echoProcessAPI.send(openProcessViewerChannel, processObject)
  }

  const pidItems = pids.map((processObject: IProcessObject) => (
    <BarButton onClick={() => handleProcessViewer(processObject)} key={processObject.pid}>
      {processObject.pid}
    </BarButton>
  ))

  return (
    <>
      <div className="w-screen h-screen bg-gray-100 flex flex-col">
        <ControlBar>
          <BarButton onClick={(e) => handleCreate(e)}>Create</BarButton>
          <>{pidItems}</>
        </ControlBar>
        <div className="grow p-4">
          <Outlet />
        </div>
      </div>
    </>
  )
}

export default App
