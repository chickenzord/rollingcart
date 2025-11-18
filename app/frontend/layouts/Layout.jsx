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
    <div className="min-h-screen bg-base-200">
      <nav className="navbar bg-base-100 shadow-sm px-8">
        <div className="navbar-start">
          <Link to="/" className="flex flex-row items-center text-xl normal-case">
            <img
              src="/favicon-32x32.png"
              alt="RollingCart Logo"
              width={32}
              height={32}
            />
            <span className="text-accent">Rolling</span><span>Cart</span>
          </Link>
          <ul className="menu menu-horizontal px-1">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={location.pathname === link.path ? 'active' : ''}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="navbar-end gap-2">
          <span className="text-base-content text-sm opacity-70">{user?.email || 'Loading...'}</span>
          <button
            onClick={logout}
            className="btn btn-error btn-sm"
          >
            Logout
          </button>
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
