import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, MapPin, Camera, LogOut } from 'lucide-react'
import { removeToken, getUser } from '../store/auth'

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/workers', icon: Users, label: 'Workers' },
  { to: '/sites', icon: MapPin, label: 'Work Sites' },
  { to: '/reports', icon: Camera, label: 'Reports' },
]

export default function Layout() {
  const navigate = useNavigate()
  const user = getUser()

  const handleLogout = () => {
    removeToken()
    navigate('/login')
  }

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-indigo-900 text-white flex flex-col">
        <div className="p-6 font-bold text-xl">Ustores Admin</div>
        <nav className="flex-1 px-4 space-y-1">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-800'}`
              }
            >
              <Icon size={20} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-indigo-700">
          <div className="text-sm opacity-80 mb-2">{user?.name}</div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm hover:text-red-300 transition">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
