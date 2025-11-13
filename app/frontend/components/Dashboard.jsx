import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white px-8 py-4 shadow-sm flex justify-between items-center">
        <h1 className="m-0 text-2xl font-semibold">Rollingcart</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">{user?.email || 'Loading...'}</span>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="p-8">
        <div className="bg-white p-8 rounded-lg shadow-sm max-w-6xl mx-auto">
          <h2 className="mt-0 text-3xl font-bold mb-4">Welcome to Rollingcart!</h2>
          <p className="mb-2">You are logged in as: <strong>{user?.email}</strong></p>
          <p className="text-gray-500 text-sm mb-8">Account ID: {user?.id}</p>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <div className="flex gap-4">
              <Link
                to="/catalog/categories"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
              >
                View Categories
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
