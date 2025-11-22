import { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import Fuse from 'fuse.js'
import { useCategories, useCatalogItems, useCreateCatalogItem, useUpdateCatalogItem } from '../../hooks/queries/useCatalogQueries'

/**
 * Modal for creating or editing a catalog item
 * @param {Object} fixedCategory - If provided, category is fixed and shown as static text
 */
export default function CatalogItemModal({ isOpen, onClose, item, onSuccess, fixedCategory }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')

  const { data: categories = [] } = useCategories()
  const { data: catalogItems = [] } = useCatalogItems({ includeCategory: true })
  const createMutation = useCreateCatalogItem()
  const updateMutation = useUpdateCatalogItem()

  const isEditMode = !!item
  const isPending = createMutation.isPending || updateMutation.isPending
  const hasFixedCategory = !!fixedCategory

  // Find similar items using Fuse.js
  const similarItems = useMemo(() => {
    if (!name.trim() || name.trim().length < 2) return []

    // Exclude current item when editing
    const itemsToSearch = isEditMode
      ? catalogItems.filter(i => i.id !== item.id)
      : catalogItems

    const fuse = new Fuse(itemsToSearch, {
      keys: ['name'],
      threshold: 0.2, // 80% similarity = 0.2 threshold
      includeScore: true,
      ignoreLocation: true,
    })

    const results = fuse.search(name.trim())
    // Filter to only show items with score <= 0.2 (80%+ similarity)
    return results
      .filter(r => r.score <= 0.2)
      .map(r => r.item)
  }, [name, catalogItems, isEditMode, item])

  // Reset form when modal opens/closes or item changes
  useEffect(() => {
    if (isOpen && item) {
      // Edit mode - populate form with item data
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(item.name || '')
      setDescription(item.description || '')
      setCategoryId(item.category_id || item.category?.id || '')
    } else if (isOpen) {
      // Create mode - reset form
      setName('')
      setDescription('')
      setCategoryId(fixedCategory?.id || '')
    }
  }, [isOpen, item, fixedCategory])

  const handleSubmit = (e) => {
    e.preventDefault()

    const itemData = {
      name: name.trim(),
      description: description.trim() || null,
      category_id: categoryId || null,
    }

    if (isEditMode) {
      updateMutation.mutate(
        { itemId: item.id, item: itemData },
        {
          onSuccess: (data) => {
            onSuccess?.('updated', data.id || item.id, itemData.name)
            onClose()
          },
        },
      )
    } else {
      createMutation.mutate(
        { item: itemData, options: {} },
        {
          onSuccess: (data) => {
            onSuccess?.('created', data.id, itemData.name)
            onClose()
          },
        },
      )
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">
          {isEditMode ? 'Edit this item' : 'Add something new'}
        </h3>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="form-control mb-4">
            <label className="label" htmlFor="item-name">
              <span className="label-text">What do you call it? <span className="text-error">*</span></span>
            </label>
            <input
              id="item-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Milk, Bread, Eggs..."
              className="input input-bordered w-full"
              required
              disabled={isPending}
            />
            {similarItems.length > 0 && (
              <div className="text-secondary text-xs mt-1">
                Similar items exist: {similarItems.map(i => i.name).join(', ')}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="form-control mb-4">
            <label className="label" htmlFor="item-description">
              <span className="label-text">How to identify it?</span>
            </label>
            <textarea
              id="item-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Local name, brand, packaging..."
              className="textarea textarea-bordered w-full"
              rows={3}
              disabled={isPending}
            />
          </div>

          {/* Category */}
          <div className="form-control mb-6">
            <label className="label" htmlFor="item-category">
              <span className="label-text">Which category?</span>
            </label>
            {hasFixedCategory ? (
              <div className="input input-bordered w-full flex items-center bg-base-200 text-base-content/70">
                {fixedCategory.name}
              </div>
            ) : (
              <select
                id="item-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="select select-bordered w-full"
                disabled={isPending}
              >
                <option value="">None</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Actions */}
          <div className="modal-action">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isPending || !name.trim()}
            >
              {isPending ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  {isEditMode ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                isEditMode ? 'Save' : 'Create'
              )}
            </button>
          </div>
        </form>
      </div>
      <div
        className="modal-backdrop"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      ></div>
    </div>
  )
}

CatalogItemModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    category_id: PropTypes.number,
    category: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }),
  }),
  onSuccess: PropTypes.func,
  fixedCategory: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  }),
}
