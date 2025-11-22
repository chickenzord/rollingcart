import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { useCategory, useCategoryItems, useDeleteCatalogItem } from '../hooks/queries/useCatalogQueries'
import { useFlash } from '../contexts/FlashContext'
import Breadcrumb from '../components/common/Breadcrumb'
import CatalogItemModal from '../components/catalog/CatalogItemModal'
import CatalogItemDetailsModal from '../components/catalog/CatalogItemDetailsModal'
import { Package, Plus, MoreVert, EditPencil, Trash } from 'iconoir-react'

export default function CatalogItems() {
  const { categoryId } = useParams()
  const [modalOpen, setModalOpen] = useState(false)
  const [itemToEdit, setItemToEdit] = useState(null)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [itemToView, setItemToView] = useState(null)
  const { flash } = useFlash()
  const queryClient = useQueryClient()

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

  // Delete mutation
  const deleteMutation = useDeleteCatalogItem()

  const loading = isCategoryLoading || isItemsLoading
  const error = categoryError || itemsError

  const handleNewItem = () => {
    setItemToEdit(null)
    setModalOpen(true)
  }

  const handleEdit = (item) => {
    setItemToEdit(item)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setItemToEdit(null)
  }

  const handleModalSuccess = (action, itemId, itemName) => {
    if (action === 'created') {
      flash.success(`"${itemName}" created successfully`)
    } else if (action === 'updated') {
      flash.success(`"${itemName}" updated successfully`)
    }
    // Invalidate category items to refresh the list
    queryClient.invalidateQueries({ queryKey: ['catalog', 'categories', categoryId, 'items'] })
  }

  const handleDeleteClick = (item) => {
    setItemToDelete(item)
  }

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      const itemName = itemToDelete.name
      deleteMutation.mutate(itemToDelete.id, {
        onSuccess: () => {
          setItemToDelete(null)
          flash.success(`"${itemName}" has been deleted`)
        },
        onError: (err) => {
          flash.error(`Error deleting item: ${err.message}`)
        },
      })
    }
  }

  const handleDeleteCancel = () => {
    setItemToDelete(null)
  }

  const handleViewDetails = (item) => {
    setItemToView(item)
    setDetailsModalOpen(true)
  }

  const handleDetailsModalClose = () => {
    setDetailsModalOpen(false)
    setItemToView(null)
  }

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
      <Breadcrumb items={[
        { label: 'Catalog', path: '/catalog' },
        { label: 'Categories', path: '/catalog/categories' },
        { label: category?.name || 'Category' },
      ]} />

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package width="32px" height="32px" strokeWidth={2} className="text-primary" />
            <h1 className="m-0 text-3xl font-bold">{category?.name || 'Category'}</h1>
          </div>
          <button onClick={handleNewItem} className="btn btn-primary btn-sm gap-2">
            <Plus width="16px" height="16px" strokeWidth={2} />
            New Item
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="alert alert-warning">
          <span>No items found in this category. Items will appear here once added.</span>
        </div>
      ) : (
        <div className="rounded-box border border-base-300">
          <table className="table">
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="cursor-pointer hover"
                  onClick={() => handleViewDetails(item)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleViewDetails(item)}
                  tabIndex={0}
                >
                  <td>
                    <div className="font-medium">{item.name}</div>
                    {item.description && (
                      <div className="text-base-content/50 text-xs">{item.description}</div>
                    )}
                  </td>
                  <td className="w-12" onClick={(e) => e.stopPropagation()}>
                    <div className="dropdown dropdown-end dropdown-left">
                      <button tabIndex={0} className="btn btn-ghost btn-xs btn-circle">
                        <MoreVert width="16px" height="16px" strokeWidth={2} />
                      </button>
                      <ul className="dropdown-content menu bg-base-100 rounded-box z-50 w-40 p-2 shadow">
                        <li>
                          <button onClick={() => handleEdit(item)} className="gap-2">
                            <EditPencil width="14px" height="14px" strokeWidth={2} />
                            Edit
                          </button>
                        </li>
                        <li>
                          <button onClick={() => handleDeleteClick(item)} className="gap-2 text-error">
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

      <div className="mt-5 stats shadow bg-primary/10">
        <div className="stat">
          <div className="stat-title">Total Items</div>
          <div className="stat-value text-primary">{items.length}</div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete Item</h3>
            <p className="py-4">
              Are you sure you want to delete <strong>{itemToDelete.name}</strong>? This action cannot be undone.
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

      {/* Create/Edit Item Modal */}
      <CatalogItemModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        item={itemToEdit}
        onSuccess={handleModalSuccess}
        fixedCategory={category ? { id: category.id, name: category.name } : undefined}
      />

      {/* Item Details Modal */}
      <CatalogItemDetailsModal
        isOpen={detailsModalOpen}
        onClose={handleDetailsModalClose}
        item={itemToView}
      />
    </div>
  )
}
