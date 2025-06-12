import { Outlet } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import './App.css'

function App() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto p-4 lg:p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default App