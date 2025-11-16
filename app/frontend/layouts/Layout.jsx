import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/backlog', label: 'Shopping List' },
    { path: '/shopping/sessions', label: 'Past Trips' },
    { path: '/catalog/categories', label: 'Catalog' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white px-8 py-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-semibold text-gray-800 hover:text-gray-900 no-underline">
              <img
                src="/favicon-32x32.png"
                alt="RollingCart Logo"
                width={32}
                height={32}
                className="inline-block mr-2"
              />
              <span className="text-accent-600">Rolling</span>Cart
            </Link>
            <div className="flex gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors no-underline ${
                    location.pathname === link.path
                      ? 'text-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm">{user?.email || 'Loading...'}</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="p-8">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
