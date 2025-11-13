import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

export default function Backlog() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeSession, setActiveSession] = useState(null)
  const [uncheckedItems, setUncheckedItems] = useState([])
  const [checkedItems, setCheckedItems] = useState([])
  const [openMenuId, setOpenMenuId] = useState(null)

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
          'Accept': 'application/json'
        }
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
          'Accept': 'application/json'
        }
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
            'Accept': 'application/json'
          }
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
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          session: { active: true }
        })
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
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to finish session')
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
          'Accept': 'application/json'
        }
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
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete item')
      }

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
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded mb-2">
                ACTIVE SESSION
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{activeSession.name}</h2>
              <p className="text-gray-600 text-sm">Started {formatTimeAgo(activeSession.created_at)}</p>
            </div>
            <button
              onClick={finishSession}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors"
            >
              Finish Session
            </button>
          </div>
          <div className="flex gap-8">
            <div>
              <div className="text-3xl font-bold text-blue-600">{checkedItems.length + uncheckedItems.length}</div>
              <div className="text-sm text-gray-600">Items in session</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">{checkedItems.length}</div>
              <div className="text-sm text-gray-600">Checked off</div>
            </div>
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

      {/* Add Item Input (Placeholder) */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Add item to backlog..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled
        />
      </div>

      {/* Unchecked Items Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Unchecked Items</h3>
          <span className="text-gray-500 text-sm">{uncheckedItems.length} items</span>
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
          <div className="space-y-2">
            {uncheckedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => toggleCheck(item, false)}
                  disabled={!activeSession}
                  className="mt-1 w-5 h-5 rounded border-gray-300 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{item.name}</div>
                  {item.category && (
                    <div className="text-sm text-gray-500">
                      {item.category.name} • Added {formatTimeAgo(item.created_at)}
                    </div>
                  )}
                  {item.notes && (
                    <div className="text-sm text-gray-700 mt-1">{item.notes}</div>
                  )}
                </div>
                <div className="relative">
                  {activeSession ? (
                    <>
                      <button
                        onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="5" r="2" />
                          <circle cx="12" cy="12" r="2" />
                          <circle cx="12" cy="19" r="2" />
                        </svg>
                      </button>
                      {openMenuId === item.id && (
                        <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => {
                              setOpenMenuId(null)
                              // TODO: Implement edit functionality
                              alert('Edit functionality coming soon!')
                            }}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                          >
                            Edit
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
                    </>
                  ) : (
                    <button
                      onClick={() => alert('Edit functionality coming soon!')}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checked Items Section (only when active session) */}
      {activeSession && checkedItems.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Checked Items</h3>
            <span className="text-gray-500 text-sm">{checkedItems.length} items</span>
          </div>

          <div className="space-y-2">
            {checkedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={true}
                  onChange={() => toggleCheck(item, true)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 cursor-pointer"
                />
                <div className="flex-1 opacity-60">
                  <div className="font-semibold text-gray-900 line-through">{item.name}</div>
                  {item.category && (
                    <div className="text-sm text-gray-500">
                      {item.category.name} • Added {formatTimeAgo(item.created_at)}
                    </div>
                  )}
                  {item.notes && (
                    <div className="text-sm text-gray-700 mt-1">{item.notes}</div>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="5" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="12" cy="19" r="2" />
                    </svg>
                  </button>
                  {openMenuId === item.id && (
                    <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => {
                          setOpenMenuId(null)
                          alert('Edit functionality coming soon!')
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                      >
                        Edit
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
