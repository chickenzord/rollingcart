import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { Cart, Packages, Clock } from 'iconoir-react'

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
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded font-medium transition-colors no-underline"
          >
            <Cart width="20px" height="20px" strokeWidth={2} />
            My Shopping List
          </Link>
          <Link
            to="/catalog/categories"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition-colors no-underline"
          >
            <Packages width="20px" height="20px" strokeWidth={2} />
            Browse Catalog
          </Link>
          <Link
            to="/shopping/sessions"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-medium transition-colors no-underline"
          >
            <Clock width="20px" height="20px" strokeWidth={2} />
            Past Trips
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
