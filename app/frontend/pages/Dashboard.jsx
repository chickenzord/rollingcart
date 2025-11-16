import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm">
      <h2 className="mt-0 text-3xl font-bold mb-4">Hey there! 👋</h2>
      <p className="mb-2 text-gray-600">Logged in as <strong>{user?.email}</strong></p>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">What would you like to do?</h3>
        <div className="flex gap-4">
          <Link
            to="/backlog"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors no-underline"
          >
            My Shopping List
          </Link>
          <Link
            to="/catalog/categories"
            className="inline-block px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition-colors no-underline"
          >
            Browse Catalog
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
