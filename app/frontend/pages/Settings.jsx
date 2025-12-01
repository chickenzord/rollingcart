import { useAuth } from '../contexts/AuthContext'
import { LogOut, InfoCircle } from 'iconoir-react'

export default function Settings() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-base-100 pb-20 lg:pb-4">
      {/* Header */}
      <div className="bg-base-200 border-b border-base-300 px-4 py-3 sticky top-0 z-20">
        <h1 className="text-lg font-semibold">Settings</h1>
      </div>

      {/* Account Section */}
      <div className="p-4">
        <h2 className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-3">
          Account
        </h2>

        <div className="bg-base-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="avatar">
              <div className="w-12 rounded-full">
                <img
                  src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(user?.email || 'default')}`}
                  alt="Avatar"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-base-content truncate">
                {user?.email || 'Loading...'}
              </div>
              <div className="text-xs text-base-content/60">
                Signed in
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <h2 className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-3">
          Actions
        </h2>

        <div className="space-y-2">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 p-4 bg-base-200 hover:bg-error/10 active:bg-error/20 rounded-lg transition-colors text-left"
          >
            <LogOut width="20px" height="20px" strokeWidth={2} className="text-error" />
            <div className="flex-1">
              <div className="text-base font-medium text-error">Logout</div>
              <div className="text-xs text-base-content/60">Sign out of your account</div>
            </div>
          </button>
        </div>

        {/* App Info */}
        <div className="mt-8 pt-8 border-t border-base-300">
          <div className="flex items-center gap-2 text-base-content/40 justify-center">
            <InfoCircle width="16px" height="16px" strokeWidth={2} />
            <span className="text-xs">RollingCart v1.0</span>
          </div>
        </div>
      </div>
    </div>
  )
}
