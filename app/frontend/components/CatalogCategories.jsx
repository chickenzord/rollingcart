import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

export default function CatalogCategories() {
  const { token } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/v1/catalog/categories', {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }

      const data = await response.json()
      setCategories(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <p>Loading categories...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <p className="text-red-600 mb-3">Error: {error}</p>
        <button
          onClick={fetchCategories}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm">
      <div className="mb-5">
        <h1 className="text-3xl font-bold">Catalog Categories</h1>
      </div>

      {categories.length === 0 ? (
        <p className="text-gray-600">No categories found. Run the seed task to populate default categories.</p>
      ) : (
        <div className="grid gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/catalog/categories/${category.id}/items`}
              className="border border-gray-300 rounded-lg p-5 bg-gray-50 hover:bg-blue-50 hover:border-blue-500 transition-all block"
            >
              <h3 className="m-0 mb-2 text-xl font-semibold text-gray-800">
                {category.name}
              </h3>
              <p className="m-0 text-gray-600 text-sm">
                ID: {category.id}
              </p>
              <p className="mt-1 text-gray-600 text-sm">
                Created: {new Date(category.created_at).toLocaleDateString()}
              </p>
              <p className="mt-2 text-blue-600 text-sm font-medium">
                View items &rarr;
              </p>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-5 p-4 bg-blue-50 rounded-lg">
        <p className="m-0 text-sm">
          <strong>Total Categories:</strong> {categories.length}
        </p>
      </div>
    </div>
  )
}
