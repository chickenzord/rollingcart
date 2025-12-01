import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCategories, useDeleteCategory } from '../hooks/queries/useCatalogQueries'
import { useFlash } from '../contexts/FlashContext'
import CategoryModal from '../components/catalog/CategoryModal'
import { MoreVert, EditPencil, Trash, Plus, NavArrowLeft } from 'iconoir-react'

export default function CatalogCategories() {
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState(null)
  const navigate = useNavigate()
  const { flash } = useFlash()

  const {
    data: categoriesData = [],
    isLoading,
    error,
    refetch,
  } = useCategories()

  const deleteMutation = useDeleteCategory()

  // Sort categories by name
  const categories = [...categoriesData].sort((a, b) =>
    a.name.localeCompare(b.name),
  )

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category)
  }

  const handleDeleteConfirm = () => {
    if (categoryToDelete) {
      const categoryName = categoryToDelete.name
      deleteMutation.mutate(categoryToDelete.id, {
        onSuccess: () => {
          setCategoryToDelete(null)
          flash.success(`"${categoryName}" has been deleted`)
        },
        onError: (err) => {
          flash.error(`Error deleting category: ${err.message}`)
        },
      })
    }
  }

  const handleDeleteCancel = () => {
    setCategoryToDelete(null)
  }

  const handleNewCategory = () => {
    setCategoryToEdit(null)
    setModalOpen(true)
  }

  const handleEdit = (category, e) => {
    e.stopPropagation()
    setCategoryToEdit(category)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setCategoryToEdit(null)
  }

  const handleModalSuccess = (action, categoryId, categoryName) => {
    if (action === 'created') {
      flash.success(`"${categoryName}" created successfully`)
    } else if (action === 'updated') {
      flash.success(`"${categoryName}" updated successfully`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-error/10 border border-error/30 rounded-lg p-4">
          <p className="text-error font-medium mb-3">Error: {error.message}</p>
          <button
            onClick={() => refetch()}
            className="btn btn-primary btn-sm"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-100 pb-20 lg:pb-4">
      {/* Header */}
      <div className="bg-base-200 border-b border-base-300 px-4 py-3 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/catalog')}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <NavArrowLeft width="20px" height="20px" strokeWidth={2} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Categories</h1>
            {categories.length > 0 && (
              <p className="text-xs text-base-content/60 mt-0.5">
                {categories.length} {categories.length === 1 ? 'category' : 'categories'}
              </p>
            )}
          </div>
          <button onClick={handleNewCategory} className="btn btn-primary btn-sm gap-1">
            <Plus width="18px" height="18px" strokeWidth={2} />
            <span className="hidden sm:inline">New</span>
          </button>
        </div>
      </div>

      {/* Categories List */}
      {categories.length === 0 ? (
        <div className="p-4">
          <div className="py-16 text-center">
            <div className="text-5xl mb-4">📂</div>
            <p className="text-base-content font-medium mb-2">No categories yet</p>
            <p className="text-base-content/60 text-sm">Add your first category to organize items</p>
          </div>
        </div>
      ) : (
        <div className="p-4 pt-2">
          <ul className="space-y-0 divide-y divide-base-300 border-y border-base-300">
            {categories.map((category) => (
              <li
                key={category.id}
                className="relative bg-base-100 hover:bg-base-200 active:bg-base-300/70 transition-colors"
              >
                <button
                  onClick={() => navigate(`/catalog/categories/${category.id}/items`)}
                  className="w-full text-left p-3 pr-12 cursor-pointer"
                >
                  <div className="font-medium text-base text-base-content">{category.name}</div>
                  {category.description && (
                    <div className="text-xs text-base-content/50 mt-1">{category.description}</div>
                  )}
                  {category.items_count !== undefined && (
                    <div className="text-sm text-base-content/60 mt-1">
                      {category.items_count} {category.items_count === 1 ? 'item' : 'items'}
                    </div>
                  )}
                </button>

                {/* 3-dot menu */}
                <div className="absolute top-2 right-2 dropdown dropdown-end">
                  <button
                    onClick={(e) => e.stopPropagation()}
                    tabIndex={0}
                    className="btn btn-ghost btn-sm btn-circle"
                  >
                    <MoreVert width="20px" height="20px" strokeWidth={2} />
                  </button>
                  <ul className="dropdown-content menu bg-base-100 rounded-box z-50 w-40 p-2 shadow-lg border border-base-300">
                    <li>
                      <button onClick={(e) => handleEdit(category, e)} className="gap-2">
                        <EditPencil width="16px" height="16px" strokeWidth={2} />
                        Edit
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleDeleteClick(category)} className="gap-2 text-error">
                        <Trash width="16px" height="16px" strokeWidth={2} />
                        Delete
                      </button>
                    </li>
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete Category</h3>
            <p className="py-4">
              Are you sure you want to delete <strong>{categoryToDelete.name}</strong>?
              {categoryToDelete.items_count > 0 && (
                <span className="block mt-2 text-warning">
                  This will make {categoryToDelete.items_count} {categoryToDelete.items_count === 1 ? 'item' : 'items'} uncategorized.
                </span>
              )}
            </p>
            <div className="modal-action">
              <button
                onClick={handleDeleteCancel}
                className="btn btn-ghost"
                disabled={deleteMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="btn btn-error"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={handleDeleteCancel}
            onKeyDown={(e) => e.key === 'Escape' && handleDeleteCancel()}
            role="button"
            tabIndex={0}
            aria-label="Close modal"
          ></div>
        </div>
      )}

      {/* Create/Edit Category Modal */}
      <CategoryModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        category={categoryToEdit}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
