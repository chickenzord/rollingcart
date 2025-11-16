import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalogItems, useCreateCatalogItem } from '../hooks/queries/useCatalogQueries'
import ShoppingItem from '../components/shopping/ShoppingItem'
import ActiveSessionCard from '../components/shopping/ActiveSessionCard'
import AutocompleteSearch from '../components/shopping/AutocompleteSearch'
import {
  useActiveSession,
  useShoppingItems,
  useCreateSession,
  useFinishSession,
  useDeleteSession,
  useAddItem,
  useCheckItem,
  useUncheckItem,
  useDeleteItem,
} from '../hooks/queries/useShoppingQueries'
import { ANIMATION_DURATIONS } from '../config/animations'

export default function Backlog() {
  // UI state (not data state)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [transitioningOutItems, setTransitioningOutItems] = useState(new Set()) // Items fading out
  const [transitioningInItems, setTransitioningInItems] = useState(new Set()) // Items fading in

  // Queries - fetch data with automatic caching
  const { data: activeSession, isLoading: isSessionLoading, error: sessionError } = useActiveSession()
  const { data: uncheckedItems = [], isLoading: isUncheckedLoading } = useShoppingItems({ isDone: false })
  const { data: checkedItems = [], isLoading: isCheckedLoading } = useShoppingItems(
    activeSession ? { forSession: activeSession.id } : {},
    { enabled: !!activeSession }, // Only fetch if there's an active session
  )
  const { data: catalogCache } = useCatalogItems({ includeCategory: true })

  // Mutations - actions that modify data
  const createSessionMutation = useCreateSession()
  const finishSessionMutation = useFinishSession()
  const deleteSessionMutation = useDeleteSession()
  const addItemMutation = useAddItem()
  const checkItemMutation = useCheckItem()
  const uncheckItemMutation = useUncheckItem()
  const deleteItemMutation = useDeleteItem()
  const createCatalogItemMutation = useCreateCatalogItem()

  // Derived loading/error state
  const loading = isSessionLoading || isUncheckedLoading || isCheckedLoading
  const error = sessionError

  const startSession = () => {
    createSessionMutation.mutate(undefined, {
      onError: (err) => alert(`Error: ${err.message}`),
    })
  }

  const finishSession = () => {
    if (!activeSession) return
    finishSessionMutation.mutate(activeSession.id, {
      onError: (err) => alert(`Error: ${err.message}`),
    })
  }

  const cancelSession = () => {
    if (!activeSession) return
    if (!confirm('Are you sure you want to cancel this session? This will delete the session.')) return

    deleteSessionMutation.mutate(activeSession.id, {
      onError: (err) => alert(`Error: ${err.message}`),
    })
  }

  const toggleCheck = (item, isCurrentlyChecked) => {
    if (isCurrentlyChecked) {
      uncheckItemMutation.mutate(item.id, {
        onSuccess: () => {
          // Start fade-out animation from checked section
          setTransitioningOutItems(prev => new Set(prev).add(item.id))

          // After fade-out completes, start fade-in in unchecked section
          setTimeout(() => {
            setTransitioningOutItems(prev => {
              const next = new Set(prev)
              next.delete(item.id)
              return next
            })
            setTransitioningInItems(prev => new Set(prev).add(item.id))
          }, ANIMATION_DURATIONS.ITEM_FADE_OUT)

          // Clear fade-in animation after it completes
          setTimeout(() => {
            setTransitioningInItems(prev => {
              const next = new Set(prev)
              next.delete(item.id)
              return next
            })
          }, ANIMATION_DURATIONS.ITEM_FULL_TRANSITION)
        },
        onError: (err) => alert(`Error: ${err.message}`),
      })
    } else {
      checkItemMutation.mutate(item.id, {
        onSuccess: () => {
          // Start fade-out animation from unchecked section
          setTransitioningOutItems(prev => new Set(prev).add(item.id))

          // After fade-out completes, start fade-in in checked section
          setTimeout(() => {
            setTransitioningOutItems(prev => {
              const next = new Set(prev)
              next.delete(item.id)
              return next
            })
            setTransitioningInItems(prev => new Set(prev).add(item.id))
          }, ANIMATION_DURATIONS.ITEM_FADE_OUT)

          // Clear fade-in animation after it completes
          setTimeout(() => {
            setTransitioningInItems(prev => {
              const next = new Set(prev)
              next.delete(item.id)
              return next
            })
          }, ANIMATION_DURATIONS.ITEM_FULL_TRANSITION)
        },
        onError: (err) => alert(`Error: ${err.message}`),
      })
    }
  }

  // Helper to check if a specific item is being checked/unchecked
  const isItemLoading = (itemId) => {
    return (
      (checkItemMutation.isPending && checkItemMutation.variables === itemId) ||
      (uncheckItemMutation.isPending && uncheckItemMutation.variables === itemId)
    )
  }

  // Helper to trigger arrival animation for newly added items
  const markItemAsArrived = (itemId) => {
    setTransitioningInItems(prev => new Set(prev).add(itemId))
    setTimeout(() => {
      setTransitioningInItems(prev => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
    }, ANIMATION_DURATIONS.ITEM_FADE_IN)
  }

  const deleteItem = (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    deleteItemMutation.mutate(itemId, {
      onError: (err) => alert(`Error: ${err.message}`),
    })
  }

  const addItemFromCatalog = (catalogItem) => {
    addItemMutation.mutate(catalogItem.id, {
      onSuccess: (newItem) => {
        // Trigger arrival animation for newly added item
        markItemAsArrived(newItem.id)
      },
      onError: (err) => alert(`Error: ${err.message}`),
    })
  }

  const createNewCatalogItem = (itemName) => {
    createCatalogItemMutation.mutate(
      { item: { name: itemName, category_id: null }, options: { addToShopping: true } },
      {
        onSuccess: (newItem) => {
          // Trigger arrival animation for newly created item
          markItemAsArrived(newItem.id)
        },
        onError: (err) => alert(`Error: ${err.message}`),
      },
    )
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

  // Loading and error states
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
        <p className="text-red-600 mb-3">Error: {error.message}</p>
        <button
          onClick={() => window.location.reload()}
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
        <h1 className="text-3xl font-bold mb-2">Shopping List</h1>
        <p className="text-gray-600 text-sm">Things you want to pick up whenever you&rsquo;re out shopping</p>
      </div>

      {/* Active Session Card or Start Button */}
      {activeSession ? (
        <ActiveSessionCard
          session={activeSession}
          hasCheckedItems={checkedItems.length > 0}
          onFinish={finishSession}
          onCancel={cancelSession}
        />
      ) : (
        <button
          onClick={startSession}
          className="w-full mb-6 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors"
        >
          Start Shopping Trip
        </button>
      )}

      {/* Unchecked Items Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Items to Get</h3>
          <span className="text-gray-500 text-sm">{uncheckedItems.length} {uncheckedItems.length === 1 ? 'item' : 'items'}</span>
        </div>

        {/* Add Item Input with Autocomplete */}
        <AutocompleteSearch
          catalogCache={catalogCache}
          existingItems={[...uncheckedItems, ...checkedItems]}
          onSelectItem={addItemFromCatalog}
          onCreateNew={createNewCatalogItem}
        />

        {uncheckedItems.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600 mb-4">Your list is empty! Add items as you think of them.</p>
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
                  {items.map((item, index) => (
                    <ShoppingItem
                      key={item.id}
                      item={item}
                      isChecked={false}
                      showCheckbox={!!activeSession}
                      onToggleCheck={() => toggleCheck(item, false)}
                      onDelete={deleteItem}
                      showCategoryLabel={shouldGroupByCategory(uncheckedItems)}
                      openMenuId={openMenuId}
                      onMenuToggle={setOpenMenuId}
                      isFirstInGroup={index === 0}
                      isLastInGroup={index === items.length - 1}
                      isLoading={isItemLoading(item.id)}
                      isTransitioningOut={transitioningOutItems.has(item.id)}
                      isTransitioningIn={transitioningInItems.has(item.id)}
                    />
                  ))}
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
            <h3 className="text-lg font-medium text-gray-600">In Your Cart</h3>
            <span className="text-gray-400 text-xs">{checkedItems.length} {checkedItems.length === 1 ? 'item' : 'items'}</span>
          </div>

          <div className="space-y-1">
            {checkedItems.map((item) => (
              <ShoppingItem
                key={item.id}
                item={item}
                isChecked={true}
                showCheckbox={true}
                onToggleCheck={() => toggleCheck(item, true)}
                onDelete={deleteItem}
                showCategoryLabel={false}
                openMenuId={openMenuId}
                onMenuToggle={setOpenMenuId}
                isLoading={isItemLoading(item.id)}
                isTransitioningOut={transitioningOutItems.has(item.id)}
                isTransitioningIn={transitioningInItems.has(item.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
