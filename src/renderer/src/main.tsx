import './assets/main.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { createBrowserRouter, createHashRouter, RouterProvider } from 'react-router-dom'
import InstructionView from './views/InstructionView'
import NewEchoServerView from './views/NewEchoServerView'
import EchoServerView from './views/EchoServerView'

const routing = [
  {
    path: '/main',
    element: <App />,
    children: [
      {
        index: true,
        element: <InstructionView />
      },
      {
        path: 'new',
        element: <NewEchoServerView />
      }
    ]
  },
  {
    path: '/process/:pid',
    element: <EchoServerView />
  }
]

const router =
  import.meta.env.MODE === 'production' ? createHashRouter(routing) : createBrowserRouter(routing)
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
