import { NavLink } from 'react-router-dom'
import { User, BarChart3, Users, MapPin, X, Menu } from 'lucide-react'
import { useState } from 'react'

type MenuItem = {
  icon: React.ComponentType<{ className?: string }>
  label: string
  path: string
}

const Sidebar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const menuItems: MenuItem[] = [
    { icon: BarChart3, label: 'Vista General', path: '/general' },
    { icon: MapPin, label: 'Ubicaciones Técnicas', path: '/locations' },
    { icon: Users, label: 'Grupos de Trabajo', path: '/groups' },
  ]

  return (
    <>
      <button
        className="fixed top-2 left-2 z-40 lg:hidden p-2 rounded-md bg-gray-200 text-gray-700"
        onClick={() => setMobileMenuOpen(true)}
      >
        <Menu size={24} />
      </button>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileMenuOpen(false)} 
          />
          <div className="fixed left-0 top-0 h-full w-full bg-gray-200 z-50">
            <div className="flex items-center justify-between p-4 border-b border-gray-300">
              <div className="flex items-center space-x-2">
                <User size={24} />
                <div>
                  <p className="font-semibold">Nombre y Apellido</p>
                  <p className="text-sm text-gray-600">Rol</p>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <nav className="p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) => 
                          `flex items-center p-3 rounded-lg ${
                            isActive ? 'bg-gray-300 font-medium' : 'hover:bg-gray-300'
                          }`
                        }
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon className="mr-3" />
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
        </div>
      )}

      <div className="hidden lg:flex lg:flex-shrink-0 shadow-[5px_0_5px_-5px_rgba(0,0,0,0.3)]">
        <div className="flex flex-col w-64 h-full bg-gray-200 text-black border-r border-gray-300">
          <div className="flex items-center justify-between p-4 border-b-2 border-gray-300">
            <div className="flex items-start space-x-2">
              <User className="text-black mt-1" size={24} />
              <div className="flex flex-col">
                <span className="text-lg font-semibold">Nombre y Apellido</span>
                <p className="text-sm text-gray-600">Rol</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => 
                        `flex items-center p-3 rounded-lg transition-colors ${
                          isActive ? 'bg-gray-300 font-medium' : 'hover:bg-gray-300'
                        }`
                      }
                    >
                      <Icon className="mr-3 text-black" />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}

export default Sidebar