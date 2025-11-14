import { useState } from 'react'
import PropTypes from 'prop-types'
import Fuse from 'fuse.js'

/**
 * Smart autocomplete search for shopping items
 * Features:
 * - Fuzzy search with Fuse.js
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Shows existing catalog items with category info
 * - Shows "Create new item" option when appropriate (3+ chars, no high similarity match)
 * - Indicates if item is already in backlog
 */
export default function AutocompleteSearch({ catalogCache, existingItems, onSelectItem, onCreateNew }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [catalogSuggestions, setCatalogSuggestions] = useState([])
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

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

    // Show "Create new item" only if query is 3+ chars and no high-similarity matches (95%+)
    const hasHighSimilarityMatch = catalogSuggestions.some(item => item.score <= 0.05)
    const showCreateOption = searchQuery.length >= 3 && !hasHighSimilarityMatch
    const totalOptions = catalogSuggestions.length + (showCreateOption ? 1 : 0)

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < totalOptions - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0) {
        if (selectedIndex < catalogSuggestions.length) {
          handleSelectItem(catalogSuggestions[selectedIndex])
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
    <div className="mb-4 relative">
      <input
        type="text"
        placeholder="Add item to backlog..."
        value={searchQuery}
        onChange={handleSearchChange}
        onKeyDown={handleSearchKeyDown}
        onFocus={() => searchQuery.length >= 1 && setShowAutocomplete(true)}
        onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {showAutocomplete && searchQuery.length >= 1 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {catalogSuggestions.map((item, index) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => handleSelectItem(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleSelectItem(item)
                }
              }}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 ${
                index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.name}</div>
                  {item.category && (
                    <div className="text-xs text-gray-500 mt-0.5">{item.category.name}</div>
                  )}
                </div>
                {isItemInBacklog(item.id) && (
                  <div className="ml-2 text-xs text-green-600 font-medium">✓ In backlog</div>
                )}
              </div>
            </div>
          ))}
          {(() => {
            const hasHighSimilarityMatch = catalogSuggestions.some(item => item.score <= 0.05)
            const showCreateOption = searchQuery.length >= 3 && !hasHighSimilarityMatch
            return showCreateOption ? (
              <div
                role="button"
                tabIndex={0}
                onClick={handleCreateNew}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleCreateNew()
                  }
                }}
                className={`px-4 py-3 cursor-pointer ${
                  selectedIndex === catalogSuggestions.length ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="text-sm text-blue-600 font-medium">
                  + Create new catalog item <span className="font-semibold">&quot;{searchQuery}&quot;</span>
                </div>
              </div>
            ) : null
          })()}
        </div>
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
}

AutocompleteSearch.defaultProps = {
  catalogCache: [],
}
