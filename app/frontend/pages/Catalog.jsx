import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/react-table'
import { useCatalogItems, useDeleteCatalogItem } from '../hooks/queries/useCatalogQueries'
import { useFlash } from '../contexts/FlashContext'
import CatalogItemModal from '../components/catalog/CatalogItemModal'
import CatalogItemDetailsModal from '../components/catalog/CatalogItemDetailsModal'
import { Link } from 'react-router-dom'
import { Search, NavArrowLeft, NavArrowRight, MoreVert, EditPencil, Trash, Plus, Settings } from 'iconoir-react'

export default function Catalog() {
  const [globalFilter, setGlobalFilter] = useState('')
  const [itemToDelete, setItemToDelete] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [itemToEdit, setItemToEdit] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [itemToView, setItemToView] = useState(null)
  const { flash } = useFlash()

  // Fetch all catalog items with category data - shares cache with Autocomplete
  const { data: items = [], isLoading, error } = useCatalogItems({ includeCategory: true })

  // Delete mutation
  const deleteMutation = useDeleteCatalogItem()

  const handleNewItem = () => {
    setItemToEdit(null)
    setModalOpen(true)
  }

  const handleViewDetails = (item) => {
    setItemToView(item)
    setDetailsModalOpen(true)
  }

  const handleDetailsModalClose = () => {
    setDetailsModalOpen(false)
    setItemToView(null)
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

  // Define columns for TanStack Table
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorFn: (row) => row.category?.name || '',
      id: 'category',
      header: 'Category',
    },
  ], [])

  // Initialize TanStack Table
  const table = useReactTable({
    data: items,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      sorting: [{ id: 'name', desc: false }],
      pagination: {
        pageSize: 20,
      },
    },
  })

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
            onClick={() => window.location.reload()}
            className="btn btn-primary btn-sm"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const { pageIndex, pageSize } = table.getState().pagination
  const totalItems = table.getFilteredRowModel().rows.length
  const startItem = pageIndex * pageSize + 1
  const endItem = Math.min((pageIndex + 1) * pageSize, totalItems)

  return (
    <div className="min-h-screen bg-base-100 pb-20 lg:pb-4">
      {/* Header */}
      <div className="bg-base-200 border-b border-base-300 px-4 py-3 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-lg font-semibold">Catalog</h1>
            {totalItems > 0 && (
              <p className="text-xs text-base-content/60 mt-0.5">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Link to="/catalog/categories" className="btn btn-ghost btn-sm gap-1">
              <Settings width="18px" height="18px" strokeWidth={2} />
              <span className="hidden sm:inline">Categories</span>
            </Link>
            <button onClick={handleNewItem} className="btn btn-primary btn-sm gap-1">
              <Plus width="18px" height="18px" strokeWidth={2} />
              <span className="hidden sm:inline">New</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <label className="input input-sm input-bordered flex items-center gap-2">
          <Search width="16px" height="16px" strokeWidth={2} className="text-base-content/50" />
          <input
            type="text"
            placeholder="Search items..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="grow"
          />
          {globalFilter && (
            <button
              onClick={() => setGlobalFilter('')}
              className="btn btn-ghost btn-xs btn-circle"
            >
              ×
            </button>
          )}
        </label>
      </div>

      {/* Results info */}
      <div className="p-4 pb-0">
        <p className="text-sm text-base-content/60">
          {totalItems === 0 ? (
            'No items found'
          ) : (
            <>{startItem}-{endItem} of {totalItems}</>
          )}
          {globalFilter && ` matching "${globalFilter}"`}
        </p>
      </div>

      {/* Items List */}
      {table.getRowModel().rows.length === 0 ? (
        <div className="p-4">
          <div className="py-16 text-center">
            <div className="text-5xl mb-4">📦</div>
            {globalFilter ? (
              <>
                <p className="text-base-content font-medium mb-2">No matches</p>
                <p className="text-base-content/60 text-sm">No items found matching &quot;{globalFilter}&quot;</p>
              </>
            ) : (
              <>
                <p className="text-base-content font-medium mb-2">No items yet</p>
                <p className="text-base-content/60 text-sm">Add your first catalog item</p>
              </>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="p-4 pt-2">
            <ul className="space-y-0 divide-y divide-base-300 border-y border-base-300">
              {table.getRowModel().rows.map((row) => {
                const item = row.original
                return (
                  <li
                    key={row.id}
                    className="relative bg-base-100 hover:bg-base-200 active:bg-base-300/70 transition-colors"
                  >
                    <button
                      onClick={() => handleViewDetails(item)}
                      className="w-full text-left p-3 pr-12 cursor-pointer"
                    >
                      <div className="font-medium text-base text-base-content">{item.name}</div>
                      <div className="text-sm text-base-content/60 mt-1">
                        {item.category?.name || 'Uncategorized'}
                      </div>
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
                          <button onClick={() => handleEdit(item)} className="gap-2">
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
                )
              })}
            </ul>
          </div>

          {/* Pagination */}
          {table.getPageCount() > 1 && (
            <div className="flex justify-center items-center gap-4 p-4">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="btn btn-sm"
              >
                <NavArrowLeft width="16px" height="16px" strokeWidth={2} />
                Prev
              </button>

              <span className="text-sm text-base-content/70">
                {pageIndex + 1} / {table.getPageCount()}
              </span>

              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="btn btn-sm"
              >
                Next
                <NavArrowRight width="16px" height="16px" strokeWidth={2} />
              </button>
            </div>
          )}
        </>
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
