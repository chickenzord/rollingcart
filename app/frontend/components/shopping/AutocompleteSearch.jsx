import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import Fuse from 'fuse.js'
import { Plus } from 'iconoir-react'

/**
 * Smart autocomplete search for shopping items
 * Features:
 * - Fuzzy search with Fuse.js
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Shows existing catalog items with category info
 * - Shows "Create new item" option when appropriate (3+ chars, no exact match)
 * - Indicates if item is already in backlog
 */
export default function AutocompleteSearch({ catalogCache, existingItems, onSelectItem, onCreateNew, placeholder }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [catalogSuggestions, setCatalogSuggestions] = useState([])
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const selectedItemRef = useRef(null)

  // Scroll selected item into view when navigating with keyboard
  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [selectedIndex])

  const searchCatalogItems = (query) => {
    if (query.length < 1) {
      setCatalogSuggestions([])
      setShowAutocomplete(false)
      return
    }

    // Use cached catalog items
    if (!catalogCache) {
      setCatalogSuggestions([])
      setShowAutocomplete(true)
      return
    }

    // Configure fuse.js for smart sorting
    const fuse = new Fuse(catalogCache, {
      keys: ['name'],
      threshold: 0.4,
      includeScore: true,
      ignoreLocation: true,
      minMatchCharLength: 1,
    })

    // Search and sort by relevance
    const results = fuse.search(query)
    const filtered = results.map(result => ({ ...result.item, score: result.score }))

    setCatalogSuggestions(filtered)
    setShowAutocomplete(true)
  }

  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    setSelectedIndex(-1)
    searchCatalogItems(query)
  }

  const handleSearchKeyDown = (e) => {
    if (!showAutocomplete) return

    // Show "Create new item" if query is 3+ chars and no exact match exists (case insensitive, trimmed)
    const hasExactMatch = catalogSuggestions.some(item =>
      item.name.trim().toLowerCase() === searchQuery.trim().toLowerCase(),
    )
    const showCreateOption = searchQuery.trim().length >= 3 && !hasExactMatch
    const totalOptions = catalogSuggestions.length + (showCreateOption ? 1 : 0)

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < totalOptions - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      // If nothing selected, act on first item
      const effectiveIndex = selectedIndex >= 0 ? selectedIndex : 0
      if (totalOptions > 0) {
        if (effectiveIndex < catalogSuggestions.length) {
          handleSelectItem(catalogSuggestions[effectiveIndex])
        } else {
          handleCreateNew()
        }
      }
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false)
      setSelectedIndex(-1)
    }
  }

  const handleSelectItem = (catalogItem) => {
    onSelectItem(catalogItem)
    setSearchQuery('')
    setShowAutocomplete(false)
    setSelectedIndex(-1)
  }

  const handleCreateNew = () => {
    onCreateNew(searchQuery)
    setSearchQuery('')
    setShowAutocomplete(false)
    setSelectedIndex(-1)
  }

  const isItemInBacklog = (catalogItemId) => {
    return existingItems.some(item => item.catalog_item_id === catalogItemId)
  }

  return (
    <div className={`dropdown w-full ${showAutocomplete && searchQuery.length >= 1 ? 'dropdown-open' : ''}`}>
      <label className="input input-sm input-bordered flex items-center gap-2 focus-within:border-accent focus-within:outline-none">
        <Plus width="16px" height="16px" strokeWidth={2} className="text-base-content/50" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
          onFocus={() => searchQuery.length >= 1 && setShowAutocomplete(true)}
          onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
          className="grow outline-none"
          role="button"
          tabIndex={0}
        />
      </label>
      {showAutocomplete && searchQuery.length >= 1 && (
        <ul className="dropdown-content menu bg-base-100 border border-base-300 rounded-box shadow-lg w-full mt-1 max-h-60 overflow-y-auto p-0 z-50 flex-nowrap">
          {catalogSuggestions.map((item, index) => (
            <li
              key={item.id}
              className="w-full"
              ref={index === selectedIndex ? selectedItemRef : null}
            >
              <button
                onClick={() => handleSelectItem(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleSelectItem(item)
                  }
                }}
                className={`px-4 py-3 flex items-center justify-between w-full rounded-none ${
                  index === selectedIndex ? 'active' : ''
                }`}
              >
                <div className="flex-1 text-left min-w-0">
                  <div className="font-medium truncate">{item.name}</div>
                  {item.category && (
                    <div className="text-xs opacity-60 mt-0.5 truncate">{item.category.name}</div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-2">
                  {isItemInBacklog(item.id) && (
                    <div className="badge badge-success badge-sm">✓ In list</div>
                  )}
                  {(selectedIndex === index || (selectedIndex === -1 && index === 0)) && (
                    <span className="text-base-content/30 text-sm">&crarr;</span>
                  )}
                </div>
              </button>
            </li>
          ))}
          {(() => {
            const hasExactMatch = catalogSuggestions.some(item =>
              item.name.trim().toLowerCase() === searchQuery.trim().toLowerCase(),
            )
            const showCreateOption = searchQuery.trim().length >= 3 && !hasExactMatch
            return showCreateOption ? (
              <li
                className="w-full"
                ref={selectedIndex === catalogSuggestions.length ? selectedItemRef : null}
              >
                <button
                  onClick={handleCreateNew}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleCreateNew()
                    }
                  }}
                  className={`px-4 py-3 w-full text-left rounded-none flex items-center justify-between ${
                    selectedIndex === catalogSuggestions.length ? 'active' : ''
                  }`}
                >
                  <div className={`text-sm font-medium truncate ${
                    selectedIndex === catalogSuggestions.length ? 'text-primary-content' : 'text-primary'
                  }`}>
                    + Create new catalog item <span className="font-semibold">&quot;{searchQuery}&quot;</span>
                  </div>
                  {(selectedIndex === catalogSuggestions.length || (selectedIndex === -1 && catalogSuggestions.length === 0)) && (
                    <span className="text-base-content/30 text-sm">&crarr;</span>
                  )}
                </button>
              </li>
            ) : null
          })()}
        </ul>
      )}
    </div>
  )
}

AutocompleteSearch.propTypes = {
  catalogCache: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      category: PropTypes.shape({
        name: PropTypes.string,
      }),
    }),
  ),
  existingItems: PropTypes.arrayOf(
    PropTypes.shape({
      catalog_item_id: PropTypes.number,
    }),
  ).isRequired,
  onSelectItem: PropTypes.func.isRequired,
  onCreateNew: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
}

AutocompleteSearch.defaultProps = {
  catalogCache: [],
  placeholder: 'Add item to shopping list...',
}
