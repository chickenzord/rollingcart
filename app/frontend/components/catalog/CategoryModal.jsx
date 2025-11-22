import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useCreateCategory, useUpdateCategory } from '../../hooks/queries/useCatalogQueries'

/**
 * Modal for creating or editing a catalog category
 */
export default function CategoryModal({ isOpen, onClose, category, onSuccess }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()

  const isEditMode = !!category
  const isPending = createMutation.isPending || updateMutation.isPending

  // Reset form when modal opens/closes or category changes
  useEffect(() => {
    if (isOpen && category) {
      // Edit mode - populate form with category data
      setName(category.name || '')
      setDescription(category.description || '')
    } else if (isOpen) {
      // Create mode - reset form
      setName('')
      setDescription('')
    }
  }, [isOpen, category])

  const handleSubmit = (e) => {
    e.preventDefault()

    const categoryData = {
      name: name.trim(),
      description: description.trim() || null,
    }

    if (isEditMode) {
      updateMutation.mutate(
        { categoryId: category.id, category: categoryData },
        {
          onSuccess: (data) => {
            onSuccess?.('updated', data.id || category.id, categoryData.name)
            onClose()
          },
        },
      )
    } else {
      createMutation.mutate(
        categoryData,
        {
          onSuccess: (data) => {
            onSuccess?.('created', data.id, categoryData.name)
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
          {isEditMode ? 'Edit Category' : 'New Category'}
        </h3>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="form-control mb-4">
            <label className="label" htmlFor="category-name">
              <span className="label-text">Name <span className="text-error">*</span></span>
            </label>
            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dairy, Produce, Snacks..."
              className="input input-bordered w-full"
              required
              disabled={isPending}
            />
          </div>

          {/* Description */}
          <div className="form-control mb-6">
            <label className="label" htmlFor="category-description">
              <span className="label-text">Description</span>
            </label>
            <textarea
              id="category-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What kind of items belong here?"
              className="textarea textarea-bordered w-full"
              rows={3}
              disabled={isPending}
            />
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

CategoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  category: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
  }),
  onSuccess: PropTypes.func,
}
