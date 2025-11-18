import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { useCategory, useCategoryItems } from '../hooks/queries/useCatalogQueries'
import * as shoppingService from '../services/shoppingService'
import { Package } from 'iconoir-react'

export default function CatalogItems() {
  const { categoryId } = useParams()
  const [addingItems, setAddingItems] = useState(new Set())

  // Fetch category details
  const {
    data: category,
    isLoading: isCategoryLoading,
    error: categoryError,
  } = useCategory(categoryId)

  // Fetch category items
  const {
    data: items = [],
    isLoading: isItemsLoading,
    error: itemsError,
    refetch,
  } = useCategoryItems(categoryId)

  // Mutation for adding item to backlog
  const addToBacklogMutation = useMutation({
    mutationFn: shoppingService.addItem,
    onMutate: (catalogItemId) => {
      // Optimistic update: show "Added" immediately
      setAddingItems(prev => new Set([...prev, catalogItemId]))
    },
    onSuccess: (data, catalogItemId) => {
      // Keep showing "Added" for 1 second for feedback
      setTimeout(() => {
        setAddingItems(prev => {
          const next = new Set(prev)
          next.delete(catalogItemId)
          return next
        })
      }, 1000)
    },
    onError: (err, catalogItemId) => {
      // Remove from "adding" state on error
      setAddingItems(prev => {
        const next = new Set(prev)
        next.delete(catalogItemId)
        return next
      })
      alert(`Error: ${err.message}`)
    },
  })

  const loading = isCategoryLoading || isItemsLoading
  const error = categoryError || itemsError

  if (loading) {
    return (
      <div className="card bg-base-100 p-8 shadow-sm">
        <p>Loading items...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card bg-base-100 p-8 shadow-sm">
        <p className="text-error mb-3">Error: {error.message}</p>
        <button
          onClick={() => refetch()}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="card bg-base-100 p-8 shadow-sm">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Package width="32px" height="32px" strokeWidth={2} className="text-primary" />
          <h1 className="m-0 text-3xl font-bold">{category?.name || 'Category'}</h1>
        </div>
        <Link to="/catalog/categories" className="link link-primary text-sm inline-block">
          &larr; Back to Categories
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="alert alert-warning">
          <span>No items found in this category. Items will appear here once added.</span>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="card bg-base-100 border border-base-300 shadow-sm"
            >
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="card-title mb-2">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-base-content/70 text-sm leading-relaxed mb-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex gap-4 text-xs text-base-content/50 border-t border-base-300 pt-2 mt-2">
                      <span>ID: {item.id}</span>
                      <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => addToBacklogMutation.mutate(item.id)}
                    disabled={addingItems.has(item.id)}
                    className={`ml-4 btn ${
                      addingItems.has(item.id)
                        ? 'btn-success'
                        : 'btn-success'
                    }`}
                  >
                    {addingItems.has(item.id) ? '✓ Added' : '+ Add to Shopping List'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 stats shadow bg-primary/10">
        <div className="stat">
          <div className="stat-title">Total Items</div>
          <div className="stat-value text-primary">{items.length}</div>
          {category && (
            <div className="stat-desc">Category ID: {category.id}</div>
          )}
        </div>
      </div>
    </div>
  )
}
