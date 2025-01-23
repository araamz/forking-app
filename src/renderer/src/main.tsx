import './assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { createBrowserRouter, createHashRouter, RouterProvider } from 'react-router-dom'
import InstructionView from './views/InstructionView'
import NewEchoServerView from './views/NewEchoServerView'
import EchoServerView from './views/EchoServerView'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <InstructionView />
      },
      {
        path: 'new',
        element: <NewEchoServerView />
      },
      {
        path: ':pid',
        element: <EchoServerView />
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
