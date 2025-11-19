import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const navLinks = [
    { path: '/', label: 'Shopping List' },
    { path: '/shopping/sessions', label: 'Past Trips' },
    { path: '/catalog/categories', label: 'Catalog' },
  ]

  return (
    <div className="min-h-screen bg-base-200">
      <nav className="navbar bg-base-100 shadow-sm">
        <div className="navbar-start">
          {/* Mobile Menu Dropdown */}
          <div className="dropdown">
            <button tabIndex={0} className="btn btn-ghost lg:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </button>
            <ul className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow gap-1">
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

          {/* Logo */}
          <Link to="/" className="flex flex-row items-center text-xl normal-case ml-2 mr-4">
            <img
              src="/favicon-32x32.png"
              alt="RollingCart Logo"
              width={32}
              height={32}
            />
            <img src="/rollingcart_text.png" alt="RollingCart" className="h-6 ml-2" />
          </Link>

          {/* Desktop Menu */}
          <ul className="menu menu-horizontal px-1 hidden lg:flex gap-1">
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
          <span className="text-base-content text-sm opacity-70 hidden sm:inline">{user?.email || 'Loading...'}</span>
          <button
            onClick={logout}
            className="btn btn-error btn-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
