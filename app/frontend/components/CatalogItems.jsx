import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link, useParams } from 'react-router-dom'

export default function CatalogItems() {
  const { categoryId } = useParams()
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCategoryAndItems()
  }, [categoryId])

  const fetchCategoryAndItems = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch category details
      const categoryResponse = await fetch(`/api/v1/catalog/categories/${categoryId}`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      if (!categoryResponse.ok) {
        throw new Error('Failed to fetch category')
      }

      const categoryData = await categoryResponse.json()
      setCategory(categoryData)

      // Fetch items for this specific category using nested endpoint
      const itemsResponse = await fetch(`/api/v1/catalog/categories/${categoryId}/items`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      if (!itemsResponse.ok) {
        throw new Error('Failed to fetch items')
      }

      const itemsData = await itemsResponse.json()
      setItems(itemsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <p>Loading items...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <button onClick={fetchCategoryAndItems}>Retry</button>
        <br />
        <Link to="/catalog/categories" style={{ marginTop: '10px', display: 'inline-block' }}>
          &larr; Back to Categories
        </Link>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 5px 0' }}>{category?.name || 'Category'}</h1>
          <Link to="/catalog/categories" style={{ textDecoration: 'none', color: '#007bff', fontSize: '14px' }}>
            &larr; Back to Categories
          </Link>
        </div>
        <Link to="/" style={{ textDecoration: 'none', color: '#007bff' }}>
          Dashboard
        </Link>
      </div>

      {items.length === 0 ? (
        <div style={{ padding: '20px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
          <p style={{ margin: 0, color: '#856404' }}>
            No items found in this category. Items will appear here once added.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                {item.name}
              </h3>
              {item.notes && (
                <p style={{
                  margin: '0 0 10px 0',
                  color: '#666',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  {item.notes}
                </p>
              )}
              <div style={{
                display: 'flex',
                gap: '15px',
                fontSize: '12px',
                color: '#888',
                borderTop: '1px solid #eee',
                paddingTop: '10px',
                marginTop: '10px'
              }}>
                <span>ID: {item.id}</span>
                <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#e3f2fd',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <p style={{ margin: 0, fontSize: '14px' }}>
          <strong>Total Items:</strong> {items.length}
        </p>
        {category && (
          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
            Category ID: {category.id}
          </p>
        )}
      </div>
    </div>
  )
}
