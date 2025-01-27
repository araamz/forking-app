import { Outlet, useNavigate } from 'react-router-dom'
import BarButton from './components/ActionButton'
import ControlBar from './components/ControlBar'
import { MouseEvent } from 'react'

function App(): JSX.Element {

  const navigate = useNavigate()

  const handleCreate = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault()
    navigate('/main/new')
  }

  const handleViewPID = (pid: string): void => {
    navigate(`/${pid}`)
  }

  return (
    <>
      <div className="w-screen h-screen bg-gray-100 flex flex-col">
        <ControlBar>
          <BarButton onClick={(e) => handleCreate(e)}>Create</BarButton>
          <BarButton>14476</BarButton>
          <BarButton>14476</BarButton>
        </ControlBar>
        <div className="grow p-4">
          <Outlet />
        </div>
      </div>
    </>
  )
}

export default App
