import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link, useParams } from 'react-router-dom'

export default function CatalogItems() {
  const { categoryId } = useParams()
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addingItems, setAddingItems] = useState(new Set())

  useEffect(() => {
    fetchCategoryAndItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          'Accept': 'application/json',
        },
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
          'Accept': 'application/json',
        },
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

  const addToBacklog = async (catalogItemId) => {
    setAddingItems(prev => new Set([...prev, catalogItemId]))

    try {
      const response = await fetch('/api/v1/shopping/items', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          catalog_item_id: catalogItemId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add item to backlog')
      }

      // Show success feedback (optional: could add toast notification)
      setTimeout(() => {
        setAddingItems(prev => {
          const next = new Set(prev)
          next.delete(catalogItemId)
          return next
        })
      }, 1000)
    } catch (err) {
      alert(`Error: ${err.message}`)
      setAddingItems(prev => {
        const next = new Set(prev)
        next.delete(catalogItemId)
        return next
      })
    }
  }

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <p>Loading items...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <p className="text-red-600 mb-3">Error: {error}</p>
        <button
          onClick={fetchCategoryAndItems}
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
        <h1 className="m-0 text-3xl font-bold">{category?.name || 'Category'}</h1>
        <Link to="/catalog/categories" className="text-blue-600 hover:text-blue-800 transition-colors text-sm no-underline inline-block mt-1">
          &larr; Back to Categories
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="p-5 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="m-0 text-yellow-800">
            No items found in this category. Items will appear here once added.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="border border-gray-300 rounded-lg p-5 bg-white shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="m-0 mb-2 text-xl font-semibold text-gray-800">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="m-0 mb-2 text-gray-600 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  <div className="flex gap-4 text-xs text-gray-500 border-t border-gray-200 pt-2 mt-2">
                    <span>ID: {item.id}</span>
                    <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => addToBacklog(item.id)}
                  disabled={addingItems.has(item.id)}
                  className={`ml-4 px-4 py-2 rounded font-medium transition-colors ${
                    addingItems.has(item.id)
                      ? 'bg-green-500 text-white cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {addingItems.has(item.id) ? '✓ Added' : '+ Add to Backlog'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 p-4 bg-blue-50 rounded-lg flex justify-between items-center">
        <p className="m-0 text-sm">
          <strong>Total Items:</strong> {items.length}
        </p>
        {category && (
          <p className="m-0 text-xs text-gray-600">
            Category ID: {category.id}
          </p>
        )}
      </div>
    </div>
  )
}
