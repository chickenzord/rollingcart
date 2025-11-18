import { Link } from 'react-router-dom'
import { useCategories } from '../hooks/queries/useCatalogQueries'
import { BookStack } from 'iconoir-react'

export default function CatalogCategories() {
  const {
    data: categories = [],
    isLoading,
    error,
    refetch,
  } = useCategories()

  if (isLoading) {
    return (
      <div className="card bg-base-100 p-8 shadow-sm">
        <p>Loading categories...</p>
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
          <BookStack width="32px" height="32px" strokeWidth={2} className="text-primary" />
          <h1 className="text-3xl font-bold">Catalog Categories</h1>
        </div>
        <p className="text-base-content/70 text-sm">Browse items by category</p>
      </div>

      {categories.length === 0 ? (
        <div className="alert alert-warning">
          <span>No categories found. Run the seed task to populate default categories.</span>
        </div>
      ) : (
        <div className="grid gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/catalog/categories/${category.id}/items`}
              className="card bg-base-200 border border-base-300 hover:bg-primary/10 hover:border-primary transition-all"
            >
              <div className="card-body">
                <h3 className="card-title">
                  {category.name}
                </h3>
                <p className="text-base-content/70 text-sm">
                  ID: {category.id}
                </p>
                <p className="text-base-content/70 text-sm">
                  Created: {new Date(category.created_at).toLocaleDateString()}
                </p>
                <p className="mt-2 text-primary text-sm font-medium">
                  View items &rarr;
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-5 stats shadow bg-primary/10">
        <div className="stat">
          <div className="stat-title">Total Categories</div>
          <div className="stat-value text-primary">{categories.length}</div>
        </div>
      </div>
    </div>
  )
}
