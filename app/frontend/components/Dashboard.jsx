import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm">
      <h2 className="mt-0 text-3xl font-bold mb-4">Welcome to Rollingcart!</h2>
      <p className="mb-2">You are logged in as: <strong>{user?.email}</strong></p>
      <p className="text-gray-500 text-sm mb-8">Account ID: {user?.id}</p>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
        <div className="flex gap-4">
          <Link
            to="/backlog"
            className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors no-underline"
          >
            Shopping Backlog
          </Link>
          <Link
            to="/catalog/categories"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors no-underline"
          >
            View Categories
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
