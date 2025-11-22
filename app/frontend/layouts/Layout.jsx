import { useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useFlash } from '../contexts/FlashContext'
import { Xmark, InfoCircle, CheckCircle, WarningTriangle, WarningCircle } from 'iconoir-react'

const flashIcons = {
  info: InfoCircle,
  success: CheckCircle,
  warning: WarningTriangle,
  error: WarningCircle,
}

const flashColors = {
  info: 'alert-info',
  success: 'alert-success',
  warning: 'alert-warning',
  error: 'alert-error',
}

function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const { messages, removeFlash, clearAll } = useFlash()

  // Clear flash messages on navigation
  useEffect(() => {
    clearAll()
  }, [location.pathname, clearAll])

  const navLinks = [
    { path: '/', label: 'Shopping List' },
    { path: '/shopping/sessions', label: 'Past Trips' },
    { path: '/catalog', label: 'Catalog' },
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

        <div className="navbar-end">
          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-ghost btn-sm gap-2">
              <div className="avatar">
                <div className="w-6 rounded-full">
                  <img
                    src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(user?.email || 'default')}`}
                    alt="Avatar"
                  />
                </div>
              </div>
              <span className="text-sm hidden sm:inline">{user?.email || 'Loading...'}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <ul className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
              <li>
                <button onClick={logout} className="text-error">
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main className="p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Flash Messages */}
          {messages.length > 0 && (
            <div className="mb-4 space-y-2">
              {messages.map((msg) => {
                const Icon = flashIcons[msg.type] || InfoCircle
                return (
                  <div key={msg.id} role="alert" className={`alert ${flashColors[msg.type] || 'alert-info'}`}>
                    <Icon width="20px" height="20px" strokeWidth={2} />
                    <span>{msg.message}</span>
                    <button
                      onClick={() => removeFlash(msg.id)}
                      className="btn btn-sm btn-circle btn-ghost"
                    >
                      <Xmark width="16px" height="16px" strokeWidth={2} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
