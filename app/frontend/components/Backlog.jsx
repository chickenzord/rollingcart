import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import Fuse from 'fuse.js'

export default function Backlog() {
  // Add glow animation styles
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes glow-pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
          background-color: rgba(59, 130, 246, 0.1);
        }
        50% {
          box-shadow: 0 0 20px 5px rgba(59, 130, 246, 0.2);
          background-color: rgba(59, 130, 246, 0.15);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          background-color: transparent;
        }
      }
      .item-glow {
        animation: glow-pulse 2s ease-out forwards;
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeSession, setActiveSession] = useState(null)
  const [uncheckedItems, setUncheckedItems] = useState([])
  const [checkedItems, setCheckedItems] = useState([])
  const [openMenuId, setOpenMenuId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [catalogSuggestions, setCatalogSuggestions] = useState([])
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [catalogCache, setCatalogCache] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch active session
      const sessionResponse = await fetch('/api/v1/shopping/sessions/active', {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      let session = null
      if (sessionResponse.ok && sessionResponse.status !== 204) {
        session = await sessionResponse.json()
        setActiveSession(session)
      } else {
        setActiveSession(null)
      }

      // Fetch unchecked items (is_done=false)
      const uncheckedResponse = await fetch('/api/v1/shopping/items?is_done=false', {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      if (!uncheckedResponse.ok) {
        throw new Error('Failed to fetch unchecked items')
      }

      const uncheckedData = await uncheckedResponse.json()
      setUncheckedItems(uncheckedData)

      // Fetch checked items if there's an active session
      if (session) {
        const checkedResponse = await fetch(`/api/v1/shopping/items?for_session=${session.id}`, {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        })

        if (checkedResponse.ok) {
          const checkedData = await checkedResponse.json()
          setCheckedItems(checkedData)
        }
      } else {
        setCheckedItems([])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const startSession = async () => {
    try {
      const response = await fetch('/api/v1/shopping/sessions', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          session: { active: true },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to start session')
      }

      await fetchData()
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  const finishSession = async () => {
    if (!activeSession) return

    try {
      const response = await fetch(`/api/v1/shopping/sessions/${activeSession.id}/finish`, {
        method: 'PATCH',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to finish session')
      }

      await fetchData()
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  const cancelSession = async () => {
    if (!activeSession) return

    if (!confirm('Are you sure you want to cancel this session? This will delete the session.')) return

    try {
      const response = await fetch(`/api/v1/shopping/sessions/${activeSession.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to cancel session')
      }

      await fetchData()
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  const toggleCheck = async (item, isCurrentlyChecked) => {
    try {
      const endpoint = isCurrentlyChecked ? 'uncheck' : 'check'
      const response = await fetch(`/api/v1/shopping/items/${item.id}/${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to ${endpoint} item`)
      }

      await fetchData()
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  const deleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`/api/v1/shopping/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete item')
      }

      await fetchData()
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  const fetchCatalogCache = async () => {
    try {
      const response = await fetch('/api/v1/catalog/items?include_category=true', {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch catalog items')
      }

      const items = await response.json()
      setCatalogCache(items)
      return items
    } catch (err) {
      console.error('Error fetching catalog cache:', err)
      return []
    }
  }

  const searchCatalogItems = async (query) => {
    if (query.length < 1) {
      setCatalogSuggestions([])
      setShowAutocomplete(false)
      return
    }

    // Use cached catalog items or fetch if not cached
    let items = catalogCache
    if (!items) {
      items = await fetchCatalogCache()
    }

    // Configure fuse.js for smart sorting
    const fuse = new Fuse(items, {
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

  const isItemInBacklog = (catalogItemId) => {
    return [...uncheckedItems, ...checkedItems].some(item => item.catalog_item_id === catalogItemId)
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
          addItemFromCatalog(catalogSuggestions[selectedIndex])
        } else {
          createNewCatalogItem()
        }
      }
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false)
      setSelectedIndex(-1)
    }
  }

  const addItemFromCatalog = async (catalogItem) => {
    try {
      const response = await fetch('/api/v1/shopping/items', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          catalog_item_id: catalogItem.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add item to backlog')
      }

      setSearchQuery('')
      setShowAutocomplete(false)
      setSelectedIndex(-1)
      await fetchData()
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  const createNewCatalogItem = async () => {
    try {
      // Create the catalog item with add_to_shopping flag
      const response = await fetch('/api/v1/catalog/items?add_to_shopping=true', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          item: {
            name: searchQuery,
            category_id: null,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create catalog item')
      }

      // Invalidate catalog cache since we added a new item
      setCatalogCache(null)

      setSearchQuery('')
      setShowAutocomplete(false)
      setSelectedIndex(-1)
      await fetchData()
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now - date) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} ${Math.floor(seconds / 60) === 1 ? 'minute' : 'minutes'} ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ${Math.floor(seconds / 3600) === 1 ? 'hour' : 'hours'} ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} ${Math.floor(seconds / 86400) === 1 ? 'day' : 'days'} ago`
    return `${Math.floor(seconds / 604800)} ${Math.floor(seconds / 604800) === 1 ? 'week' : 'weeks'} ago`
  }

  const groupItemsByCategory = (items) => {
    const categories = {}
    items.forEach(item => {
      const categoryName = item.category?.name || 'Uncategorized'
      if (!categories[categoryName]) {
        categories[categoryName] = []
      }
      categories[categoryName].push(item)
    })
    return categories
  }

  const shouldGroupByCategory = (items) => {
    const uniqueCategories = new Set(items.map(item => item.category?.name || 'Uncategorized'))
    return uniqueCategories.size > 1
  }

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <p>Loading shopping items...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <p className="text-red-600 mb-3">Error: {error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Shopping Backlog</h1>
        <p className="text-gray-600 text-sm">Items waiting to be added to your next shopping trip</p>
      </div>

      {/* Active Session Card or Start Button */}
      {activeSession ? (
        <div className="mb-6 p-6 border-2 border-blue-500 rounded-lg bg-blue-50">
          <div className="flex justify-between items-start">
            <div>
              <div className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded mb-2">
                ACTIVE SESSION
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{activeSession.name}</h2>
              <p className="text-gray-600 text-sm">Started {formatTimeAgo(activeSession.created_at)}</p>
            </div>
            {checkedItems.length > 0 ? (
              <button
                onClick={finishSession}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors"
              >
                Finish
              </button>
            ) : (
              <button
                onClick={cancelSession}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={startSession}
          className="w-full mb-6 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors"
        >
          Start Shopping Session
        </button>
      )}

      {/* Unchecked Items Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Unchecked Items</h3>
          <span className="text-gray-500 text-sm">{uncheckedItems.length} items</span>
        </div>

        {/* Add Item Input with Autocomplete */}
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
                  onClick={() => addItemFromCatalog(item)}
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
                    onClick={createNewCatalogItem}
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

        {uncheckedItems.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600 mb-4">No items in your shopping backlog yet.</p>
            <Link
              to="/catalog/categories"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors no-underline"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupItemsByCategory(uncheckedItems)).map(([categoryName, items]) => (
              <div key={categoryName}>
                {shouldGroupByCategory(uncheckedItems) && (
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 px-1">{categoryName}</h4>
                )}
                <div className="border border-gray-200 rounded-lg">
                  {items.map((item, index) => {
                    const isNew = Date.now() - new Date(item.created_at).getTime() < 2000
                    return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${
                        index !== items.length - 1 ? 'border-b border-gray-200' : ''
                      } ${index === 0 ? 'rounded-t-lg' : ''} ${index === items.length - 1 ? 'rounded-b-lg' : ''} ${
                        isNew ? 'item-glow' : ''
                      }`}
                    >
                      {activeSession && (
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => toggleCheck(item, false)}
                          className="w-5 h-5 rounded border-gray-300 cursor-pointer flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900">{item.name}</div>
                        {(item.category || item.description) && (
                          <div className="text-sm text-gray-500 mt-0.5">
                            {shouldGroupByCategory(uncheckedItems) ? (
                              item.description
                            ) : (
                              <>
                                {item.category && item.category.name}
                                {item.category && item.description && ' • '}
                                {item.description}
                              </>
                            )}
                          </div>
                        )}
                        {item.notes && (
                          <div className="text-sm text-gray-700 mt-0.5 italic">{item.notes}</div>
                        )}
                      </div>
                      <div className="relative flex-shrink-0">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                          className="p-2 hover:bg-gray-200 rounded transition-colors relative z-0"
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="5" r="2" />
                            <circle cx="12" cy="12" r="2" />
                            <circle cx="12" cy="19" r="2" />
                          </svg>
                        </button>
                        {openMenuId === item.id && (
                          <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                            <button
                              onClick={() => {
                                setOpenMenuId(null)
                                // TODO: Implement edit functionality
                                alert('Edit functionality coming soon!')
                              }}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                            >
                              Edit Notes
                            </button>
                            <button
                              onClick={() => {
                                setOpenMenuId(null)
                                deleteItem(item.id)
                              }}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checked Items Section (only when active session) */}
      {activeSession && checkedItems.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-gray-600">Checked Items</h3>
            <span className="text-gray-400 text-xs">{checkedItems.length} items</span>
          </div>

          <div className="space-y-1">
            {checkedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 transition-colors opacity-70"
              >
                <input
                  type="checkbox"
                  checked={true}
                  onChange={() => toggleCheck(item, true)}
                  className="w-4 h-4 rounded border-gray-300 cursor-pointer flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-700 line-through truncate">{item.name}</div>
                  {(item.category || item.description) && (
                    <div className="text-xs text-gray-400 truncate">
                      {item.category && item.category.name}
                      {item.category && item.description && ' • '}
                      {item.description}
                    </div>
                  )}
                </div>
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="5" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="12" cy="19" r="2" />
                    </svg>
                  </button>
                  {openMenuId === item.id && (
                    <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => {
                          setOpenMenuId(null)
                          alert('Edit functionality coming soon!')
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                      >
                        Edit Notes
                      </button>
                      <button
                        onClick={() => {
                          setOpenMenuId(null)
                          deleteItem(item.id)
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
