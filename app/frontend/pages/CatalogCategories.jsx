import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCategories, useDeleteCategory } from '../hooks/queries/useCatalogQueries'
import { useFlash } from '../contexts/FlashContext'
import Breadcrumb from '../components/common/Breadcrumb'
import CategoryModal from '../components/catalog/CategoryModal'
import { BookStack, MoreVert, EditPencil, Trash, Plus } from 'iconoir-react'

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

  const handleEdit = (category) => {
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
      <Breadcrumb items={[
        { label: 'Catalog', path: '/catalog' },
        { label: 'Categories' },
      ]} />

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookStack width="32px" height="32px" strokeWidth={2} className="text-primary" />
            <h1 className="text-3xl font-bold">Categories</h1>
          </div>
          <button onClick={handleNewCategory} className="btn btn-primary btn-sm gap-2">
            <Plus width="16px" height="16px" strokeWidth={2} />
            New Category
          </button>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="alert alert-warning">
          <span>No categories found. Run the seed task to populate default categories.</span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-box border border-base-300">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="cursor-pointer hover"
                  onClick={() => navigate(`/catalog/categories/${category.id}/items`)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate(`/catalog/categories/${category.id}/items`)}
                  tabIndex={0}
                >
                  <td>
                    <div className="font-medium">{category.name}</div>
                    {category.description && (
                      <div className="text-base-content/50 text-xs">{category.description}</div>
                    )}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="dropdown dropdown-end dropdown-left">
                      <button tabIndex={0} className="btn btn-ghost btn-xs btn-circle">
                        <MoreVert width="16px" height="16px" strokeWidth={2} />
                      </button>
                      <ul className="dropdown-content menu bg-base-100 rounded-box z-50 w-40 p-2 shadow">
                        <li>
                          <button onClick={() => handleEdit(category)} className="gap-2">
                            <EditPencil width="14px" height="14px" strokeWidth={2} />
                            Edit
                          </button>
                        </li>
                        <li>
                          <button onClick={() => handleDeleteClick(category)} className="gap-2 text-error">
                            <Trash width="14px" height="14px" strokeWidth={2} />
                            Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

      <div className="mt-5 stats shadow bg-primary/10">
        <div className="stat">
          <div className="stat-title">Total Categories</div>
          <div className="stat-value text-primary">{categories.length}</div>
        </div>
      </div>

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
