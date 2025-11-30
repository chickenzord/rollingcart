import { useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useFlash } from '../contexts/FlashContext'
import { Xmark, InfoCircle, CheckCircle, WarningTriangle, WarningCircle, ShoppingBag, Clock, BookStack, Settings } from 'iconoir-react'

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
  const location = useLocation()
  const { messages, removeFlash, clearAll } = useFlash()

  // Clear flash messages on navigation
  useEffect(() => {
    clearAll()
  }, [location.pathname, clearAll])

  const navLinks = [
    { path: '/', label: 'List', icon: ShoppingBag },
    { path: '/shopping/sessions', label: 'History', icon: Clock },
    { path: '/catalog', label: 'Catalog', icon: BookStack },
    { path: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      {/* Mobile-first bottom navigation */}
      <nav className="order-2 lg:order-1 sticky bottom-0 lg:static bg-base-100 border-t lg:border-b border-base-300 lg:shadow-sm z-20">
        {/* Desktop navbar */}
        <div className="hidden lg:flex navbar">
          <div className="navbar-start">
            <Link to="/" className="flex flex-row items-center text-xl normal-case">
              <img
                src="/favicon-32x32.png"
                alt="RollingCart Logo"
                width={32}
                height={32}
              />
              <img src="/rollingcart_text.png" alt="RollingCart" className="h-6 ml-2" />
            </Link>
          </div>

          <div className="navbar-center">
            <ul className="menu menu-horizontal px-1 gap-1">
              {navLinks.slice(0, 3).map((link) => (
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
            <Link
              to="/settings"
              className={`btn btn-ghost btn-sm gap-2 ${location.pathname === '/settings' ? 'active' : ''}`}
            >
              <Settings width="18px" height="18px" strokeWidth={2} />
              Settings
            </Link>
          </div>
        </div>

        {/* Mobile bottom tab bar */}
        <div className="lg:hidden h-16 border-t border-base-300 grid grid-cols-4 bg-base-100">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex flex-col items-center justify-center gap-1 ${isActive ? 'text-primary' : 'text-base-content/60'} active:bg-base-200 transition-colors`}
              >
                <Icon width="24px" height="24px" strokeWidth={2} />
                <span className="text-xs font-medium">{link.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <main className="order-1 lg:order-2 flex-1">
        {/* Flash Messages */}
        {messages.length > 0 && (
          <div className="fixed top-4 left-4 right-4 z-50 space-y-2">
            {messages.map((msg) => {
              const Icon = flashIcons[msg.type] || InfoCircle
              return (
                <div
                  key={msg.id}
                  role="alert"
                  className={`alert ${flashColors[msg.type] || 'alert-info'} shadow-lg ${msg.dismissing ? 'animate-slide-up' : 'animate-slide-down'}`}
                >
                  <Icon width="20px" height="20px" strokeWidth={2} />
                  <span className="text-sm">{msg.message}</span>
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
      </main>
    </div>
  )
}

export default Layout
