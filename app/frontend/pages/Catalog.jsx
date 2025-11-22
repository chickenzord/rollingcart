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
import { Box, Search, NavArrowLeft, NavArrowRight, MoreVert, EditPencil, Trash, Plus } from 'iconoir-react'

export default function Catalog() {
  const [globalFilter, setGlobalFilter] = useState('')
  const [itemToDelete, setItemToDelete] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [itemToEdit, setItemToEdit] = useState(null)
  const { flash } = useFlash()

  // Fetch all catalog items with category data - shares cache with Autocomplete
  const { data: items = [], isLoading, error } = useCatalogItems({ includeCategory: true })

  // Delete mutation
  const deleteMutation = useDeleteCatalogItem()

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
      <div className="card bg-base-100 p-8 shadow-sm">
        <p>Loading catalog...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card bg-base-100 p-8 shadow-sm">
        <p className="text-error mb-3">Error: {error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    )
  }

  const { pageIndex, pageSize } = table.getState().pagination
  const totalItems = table.getFilteredRowModel().rows.length
  const startItem = pageIndex * pageSize + 1
  const endItem = Math.min((pageIndex + 1) * pageSize, totalItems)

  return (
    <div className="card bg-base-100 p-8 shadow-sm">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Box width="32px" height="32px" strokeWidth={2} className="text-primary" />
            <h1 className="text-3xl font-bold">Catalog</h1>
          </div>
          <button onClick={handleNewItem} className="btn btn-primary btn-sm gap-2">
            <Plus width="16px" height="16px" strokeWidth={2} />
            New Item
          </button>
        </div>
        <p className="text-base-content/70 text-sm">All items available for your shopping list</p>
      </div>

      {/* Search Filter */}
      <div className="mb-6">
        <label className="input input-bordered flex items-center gap-2">
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
      <div className="mb-4 text-sm text-base-content/70">
        {totalItems === 0 ? (
          'No items found'
        ) : (
          <>Showing {startItem}-{endItem} of {totalItems} {totalItems === 1 ? 'item' : 'items'}</>
        )}
        {globalFilter && ` matching "${globalFilter}"`}
      </div>

      {/* Items Table */}
      {table.getRowModel().rows.length === 0 ? (
        <div className="p-8 text-center bg-base-200 rounded-lg border-2 border-dashed border-base-300">
          {globalFilter ? (
            <p className="text-base-content/70">No items found matching &ldquo;{globalFilter}&rdquo;</p>
          ) : (
            <p className="text-base-content/70">No items in catalog yet.</p>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-box border border-base-300">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => {
                  const item = row.original
                  return (
                    <tr key={row.id}>
                      <td>
                        <div className="font-medium">{item.name}</div>
                        {item.description && (
                          <div className="text-base-content/50 text-xs">{item.description}</div>
                        )}
                      </td>
                      <td className="text-base-content/70 text-sm">
                        {item.category?.name || 'Uncategorized'}
                      </td>
                      <td>
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
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {table.getPageCount() > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="btn btn-sm btn-ghost"
              >
                <NavArrowLeft width="16px" height="16px" strokeWidth={2} />
                Prev
              </button>

              <span className="text-sm text-base-content/70">
                Page {pageIndex + 1} of {table.getPageCount()}
              </span>

              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="btn btn-sm btn-ghost"
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
          <div className="modal-backdrop" onClick={handleDeleteCancel}></div>
        </div>
      )}

      {/* Create/Edit Item Modal */}
      <CatalogItemModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        item={itemToEdit}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
