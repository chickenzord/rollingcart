import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { useCategory, useCategoryItems, useDeleteCatalogItem } from '../hooks/queries/useCatalogQueries'
import { useFlash } from '../contexts/FlashContext'
import CatalogItemModal from '../components/catalog/CatalogItemModal'
import CatalogItemDetailsModal from '../components/catalog/CatalogItemDetailsModal'
import { Plus, MoreVert, EditPencil, Trash, NavArrowLeft } from 'iconoir-react'

export default function CatalogItems() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
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

  const handleEdit = (item, e) => {
    e.stopPropagation()
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
      {/* Header - Sticky */}
      <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 p-4">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate('/catalog/categories')}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <NavArrowLeft width="20px" height="20px" strokeWidth={2} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">{category?.name || 'Category'}</h1>
            {category?.description && (
              <p className="text-sm text-base-content/60 mt-1">{category.description}</p>
            )}
          </div>
          <button onClick={handleNewItem} className="btn btn-primary btn-sm gap-1">
            <Plus width="18px" height="18px" strokeWidth={2} />
            <span className="hidden sm:inline">New</span>
          </button>
        </div>
      </div>

      {/* Results info */}
      <div className="p-4 pb-0">
        <p className="text-sm text-base-content/60">
          {items.length === 0 ? 'No items found' : `${items.length} ${items.length === 1 ? 'item' : 'items'}`}
        </p>
      </div>

      {/* Items List */}
      {items.length === 0 ? (
        <div className="p-4">
          <div className="py-16 text-center">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-base-content font-medium mb-2">No items yet</p>
            <p className="text-base-content/60 text-sm">Add items to this category</p>
          </div>
        </div>
      ) : (
        <div className="p-4 pt-2">
          <ul className="space-y-0 divide-y divide-base-300 border-y border-base-300">
            {items.map((item) => (
              <li
                key={item.id}
                className="relative bg-base-100 hover:bg-base-200 active:bg-base-300/70 transition-colors"
              >
                <button
                  onClick={() => handleViewDetails(item)}
                  className="w-full text-left p-3 pr-12 cursor-pointer"
                >
                  <div className="font-medium text-base text-base-content">{item.name}</div>
                  {item.description && (
                    <div className="text-xs text-base-content/50 mt-1">{item.description}</div>
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
                      <button onClick={(e) => handleEdit(item, e)} className="gap-2">
                        <EditPencil width="16px" height="16px" strokeWidth={2} />
                        Edit
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleDeleteClick(item)} className="gap-2 text-error">
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
