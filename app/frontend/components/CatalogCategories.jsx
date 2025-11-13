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
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <p>Loading categories...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <button onClick={fetchCategories}>Retry</button>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Catalog Categories</h1>
        <Link to="/" style={{ textDecoration: 'none', color: '#007bff' }}>
          &larr; Back to Dashboard
        </Link>
      </div>

      {categories.length === 0 ? (
        <p style={{ color: '#666' }}>No categories found. Run the seed task to populate default categories.</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/catalog/categories/${category.id}/items`}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#f9f9f9',
                textDecoration: 'none',
                color: 'inherit',
                display: 'block',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e8f4f8'
                e.currentTarget.style.borderColor = '#007bff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f9f9f9'
                e.currentTarget.style.borderColor = '#ddd'
              }}
            >
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                {category.name}
              </h3>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                ID: {category.id}
              </p>
              <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                Created: {new Date(category.created_at).toLocaleDateString()}
              </p>
              <p style={{ margin: '10px 0 0 0', color: '#007bff', fontSize: '14px', fontWeight: '500' }}>
                View items &rarr;
              </p>
            </Link>
          ))}
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
        <p style={{ margin: 0, fontSize: '14px' }}>
          <strong>Total Categories:</strong> {categories.length}
        </p>
      </div>
    </div>
  )
}
