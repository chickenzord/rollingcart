import { useState } from 'react'
import { useCatalogItems, useCreateCatalogItem } from '../hooks/queries/useCatalogQueries'
import ShoppingItem from '../components/shopping/ShoppingItem'
import ActiveSessionCard from '../components/shopping/ActiveSessionCard'
import AutocompleteSearch from '../components/shopping/AutocompleteSearch'
import CancelSessionModal from '../components/shopping/CancelSessionModal'
import {
  useActiveSession,
  useSessions,
  useShoppingItems,
  useCreateSession,
  useReactivateSession,
  useFinishSession,
  useDeleteSession,
  useUncheckSessionItems,
  useDeleteSessionItems,
  useAddItem,
  useCheckItem,
  useUncheckItem,
  useDeleteItem,
} from '../hooks/queries/useShoppingQueries'
import { ANIMATION_DURATIONS } from '../config/animations'
import { Cart, ShoppingBag, CheckCircle, Clock } from 'iconoir-react'
import { isWithin24Hours } from '../utils/dateUtils'

export default function Backlog() {
  // UI state (not data state)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [transitioningOutItems, setTransitioningOutItems] = useState(new Set()) // Items fading out
  const [transitioningInItems, setTransitioningInItems] = useState(new Set()) // Items fading in
  const [showCancelModal, setShowCancelModal] = useState(false)

  // Queries - fetch data with automatic caching
  const { data: activeSession, isLoading: isSessionLoading, error: sessionError } = useActiveSession()
  const { data: allSessions = [] } = useSessions()
  const { data: uncheckedItems = [], isLoading: isUncheckedLoading } = useShoppingItems({ isDone: false })
  const { data: checkedItems = [], isLoading: isCheckedLoading } = useShoppingItems(
    activeSession ? { forSession: activeSession.id } : {},
    { enabled: !!activeSession }, // Only fetch if there's an active session
  )
  const { data: catalogCache } = useCatalogItems({ includeCategory: true })

  // Mutations - actions that modify data
  const createSessionMutation = useCreateSession()
  const reactivateSessionMutation = useReactivateSession()
  const finishSessionMutation = useFinishSession()
  const deleteSessionMutation = useDeleteSession()
  const uncheckSessionItemsMutation = useUncheckSessionItems()
  const deleteSessionItemsMutation = useDeleteSessionItems()
  const addItemMutation = useAddItem()
  const checkItemMutation = useCheckItem()
  const uncheckItemMutation = useUncheckItem()
  const deleteItemMutation = useDeleteItem()
  const createCatalogItemMutation = useCreateCatalogItem()

  // Derived loading/error state
  const loading = isSessionLoading || isUncheckedLoading || isCheckedLoading
  const error = sessionError

  // Find most recent finished session within 24 hours
  const recentSession = allSessions.find(
    session => !session.active && isWithin24Hours(session.created_at),
  )

  const startSession = () => {
    createSessionMutation.mutate(undefined, {
      onError: (err) => alert(`Error: ${err.message}`),
    })
  }

  const continueRecentSession = () => {
    if (!recentSession) return
    reactivateSessionMutation.mutate(recentSession.id, {
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

    // If there are checked items, show modal to decide what to do with them
    if (checkedItems.length > 0) {
      setShowCancelModal(true)
    } else {
      // If no checked items, delete session immediately (nothing to decide)
      deleteSessionMutation.mutate(activeSession.id, {
        onError: (err) => alert(`Error: ${err.message}`),
      })
    }
  }

  const handleKeepItems = async (sessionId) => {
    // First uncheck all items (return to backlog)
    await uncheckSessionItemsMutation.mutateAsync(sessionId)
    // Then delete the session
    await deleteSessionMutation.mutateAsync(sessionId)
  }

  const handleRemoveItems = async (sessionId) => {
    // First delete all items
    await deleteSessionItemsMutation.mutateAsync(sessionId)
    // Then delete the session
    await deleteSessionMutation.mutateAsync(sessionId)
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

  // Compute adaptive placeholder based on current state
  const getPlaceholder = () => {
    if (activeSession) {
      if (uncheckedItems.length === 0 && checkedItems.length > 0) {
        return "Need anything else while you're here?"
      }
      return 'Add more items as you shop...'
    } else {
      if (uncheckedItems.length === 0) {
        return 'What do you need to pick up?'
      }
      return 'Add item to shopping list...'
    }
  }

  // Loading and error states
  if (loading) {
    return (
      <div className="card bg-base-100 p-8 shadow-sm">
        <p>Loading shopping items...</p>
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


  return (
    <div className="card bg-base-100 p-8 shadow-sm">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <ShoppingBag width="32px" height="32px" strokeWidth={2} className="text-primary" />
          <h1 className="text-3xl font-bold">Shopping List</h1>
        </div>
        <p className="text-base-content/70 text-sm">Things you want to pick up whenever you&rsquo;re out shopping</p>
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
        <div className="mb-6 flex gap-3 flex-wrap">
          {/* Primary action - Start new session */}
          <button
            onClick={startSession}
            className="flex-1 min-w-[200px] btn btn-primary gap-3"
          >
            <Cart width="24px" height="24px" strokeWidth={2} />
            Start Shopping Trip
          </button>

          {/* Secondary action - Continue recent session (only if available) */}
          {recentSession && (
            <button
              onClick={continueRecentSession}
              className="btn btn-secondary gap-2 h-auto"
            >
              <Clock width="20px" height="20px" strokeWidth={2} className="shrink-0" />
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-medium normal-case">Continue Recent</span>
                <span className="text-xs font-light normal-case">{recentSession.name}</span>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Unchecked Items Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Items to Get</h3>
          <span className="text-base-content/70 text-sm">{uncheckedItems.length} {uncheckedItems.length === 1 ? 'item' : 'items'}</span>
        </div>

        {/* Add Item Input with Autocomplete */}
        <AutocompleteSearch
          catalogCache={catalogCache}
          existingItems={[...uncheckedItems, ...checkedItems]}
          onSelectItem={addItemFromCatalog}
          onCreateNew={createNewCatalogItem}
          placeholder={getPlaceholder()}
        />

        {uncheckedItems.length === 0 ? (
          <div className="p-8 text-center bg-base-200 rounded-lg border-2 border-dashed border-base-300">
            {activeSession && checkedItems.length > 0 ? (
              <>
                <p className="text-base-content mb-2">🎉 Nice! You&rsquo;ve got everything in your cart.</p>
                <p className="text-base-content/70 text-sm">Feel free to add more items or wrap up your trip when you&rsquo;re ready!</p>
              </>
            ) : (
              <p className="text-base-content/70">Your list is empty! Add items as you think of them.</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupItemsByCategory(uncheckedItems)).map(([categoryName, items]) => (
              <div key={categoryName}>
                {shouldGroupByCategory(uncheckedItems) && (
                  <h4 className="text-sm font-semibold text-base-content mb-2 px-1">{categoryName}</h4>
                )}
                <ul className="list bg-base-100 rounded-box border border-base-300 divide-y divide-base-300">
                  {items.map((item, _index) => (
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
                      isLoading={isItemLoading(item.id)}
                      isTransitioningOut={transitioningOutItems.has(item.id)}
                      isTransitioningIn={transitioningInItems.has(item.id)}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checked Items Section (only when active session) */}
      {activeSession && checkedItems.length > 0 && (
        <div className='mt-8'>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-base-content/70">In Your Cart</h3>
            <span className="text-base-content/50 text-xs">{checkedItems.length} {checkedItems.length === 1 ? 'item' : 'items'}</span>
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

          {/* Subtle Finish Session prompt */}
          <div className="mt-3">
            <p className="text-xs text-base-content/70 mb-2 text-center italic">
              Ready to wrap up? Finishing your trip will clear these items from your shopping list.
              {uncheckedItems.length > 0 && (
                <> The {uncheckedItems.length} remaining {uncheckedItems.length === 1 ? 'item' : 'items'} will stay for next time.</>
              )} 👍
            </p>
            <button
              onClick={finishSession}
              className="w-full btn btn-secondary btn-sm gap-2"
            >
              <CheckCircle width="16px" height="16px" strokeWidth={2} />
              Done Shopping
            </button>
          </div>
        </div>
      )}

      {/* Cancel Session Modal */}
      {activeSession && (
        <CancelSessionModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          sessionId={activeSession.id}
          itemCount={checkedItems.length}
          onKeepItems={handleKeepItems}
          onRemoveItems={handleRemoveItems}
        />
      )}
    </div>
  )
}
