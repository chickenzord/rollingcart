import { useState, useEffect, useRef } from 'react'
import { useCatalogItems, useCreateCatalogItem } from '../hooks/queries/useCatalogQueries'
import ShoppingItem from '../components/shopping/ShoppingItem'
import ActiveSessionCard from '../components/shopping/ActiveSessionCard'
import AutocompleteSearch from '../components/shopping/AutocompleteSearch'
import CancelSessionModal from '../components/shopping/CancelSessionModal'
import ConfirmationModal from '../components/common/ConfirmationModal'
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
import { Cart, CheckCircle, Clock, Plus } from 'iconoir-react'
import { isWithin24Hours } from '../utils/dateUtils'

export default function Backlog() {
  // UI state (not data state)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [showSearch, setShowSearch] = useState(true)
  const lastScrollY = useRef(0)

  // Auto-hide search on scroll with debounce to prevent stuttering
  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY

          if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
            // Scrolling down & past threshold
            setShowSearch(false)
          } else if (currentScrollY < lastScrollY.current) {
            // Scrolling up
            setShowSearch(true)
          }

          lastScrollY.current = currentScrollY
          ticking = false
        })

        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Queries - fetch data with automatic caching
  const { data: activeSession, isLoading: isSessionLoading, error: sessionError } = useActiveSession()
  const { data: allSessions = [] } = useSessions()
  const { data: uncheckedItems = [], isLoading: isUncheckedLoading } = useShoppingItems({ isDone: false })
  const { data: checkedItems = [], isLoading: isCheckedLoading } = useShoppingItems(
    activeSession ? { forSession: activeSession.id } : { isDone: false },
    {
      enabled: !!activeSession, // Only fetch if there's an active session
      placeholderData: [], // Return empty array when query is disabled
    },
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
        onError: (err) => alert(`Error: ${err.message}`),
      })
    } else {
      checkItemMutation.mutate(item.id, {
        onError: (err) => alert(`Error: ${err.message}`),
      })
    }
  }

  const deleteItem = (item) => {
    setItemToDelete(item)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return

    deleteItemMutation.mutate(itemToDelete.id, {
      onSuccess: () => {
        setShowDeleteModal(false)
        setItemToDelete(null)
      },
      onError: (err) => {
        alert(`Error: ${err.message}`)
      },
    })
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setItemToDelete(null)
  }

  const addItemFromCatalog = (catalogItem) => {
    addItemMutation.mutate(catalogItem.id, {
      onError: (err) => alert(`Error: ${err.message}`),
    })
  }

  const createNewCatalogItem = (itemName) => {
    createCatalogItemMutation.mutate(
      { item: { name: itemName, category_id: null }, options: { addToShopping: true } },
      {
        onError: (err) => alert(`Error: ${err.message}`),
      },
    )
  }

  const handleFabClick = () => {
    setShowSearch(true)
    // Focus on search input after animation
    setTimeout(() => {
      const input = document.querySelector('[placeholder*="Add"]')
      if (input) {
        input.focus()
      }
    }, 300)
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


  return (
    <div className="min-h-screen bg-base-100 pb-20 lg:pb-4">
      {/* Header */}
      <div className="bg-base-200 border-b border-base-300 px-4 py-3 sticky top-0 z-20">
        <div className="mb-2">
          <h1 className="text-lg font-semibold">Shopping List</h1>
          {uncheckedItems.length > 0 && (
            <p className="text-xs text-base-content/60 mt-0.5">
              {uncheckedItems.length} {uncheckedItems.length === 1 ? 'item' : 'items'} in backlog
            </p>
          )}
        </div>

        {/* Search - Auto-hide on scroll */}
        <div className={`relative transition-all duration-300 ease-in-out ${showSearch ? 'h-8' : 'h-0 overflow-hidden'}`}>
          <div className="absolute inset-x-0 top-0">
            <AutocompleteSearch
              catalogCache={catalogCache}
              existingItems={[...uncheckedItems, ...checkedItems]}
              onSelectItem={addItemFromCatalog}
              onCreateNew={createNewCatalogItem}
              placeholder={getPlaceholder()}
            />
          </div>
        </div>
      </div>

      {/* Active Session Banner */}
      {activeSession && (
        <div className="bg-base-100 border-b border-base-300">
          <ActiveSessionCard
            session={activeSession}
            hasCheckedItems={checkedItems.length > 0}
            onFinish={finishSession}
            onCancel={cancelSession}
          />
        </div>
      )}

      {/* Start Shopping Button (when no active session) */}
      {!activeSession && uncheckedItems.length > 0 && (
        <div className="px-4 py-3 bg-base-200 border-b border-base-300">
          <button
            onClick={startSession}
            className="w-full btn btn-primary btn-sm gap-2"
          >
            <Cart width="18px" height="18px" strokeWidth={2} />
            Start Shopping Trip
          </button>

          {recentSession && (
            <button
              onClick={continueRecentSession}
              className="w-full btn btn-outline btn-primary btn-sm gap-2 mt-2"
            >
              <Clock width="16px" height="16px" strokeWidth={2} />
              Continue: {recentSession.name}
            </button>
          )}
        </div>
      )}

      {/* Unchecked Items Section */}
      <div className="p-4">

        {uncheckedItems.length === 0 ? (
          <div className="py-12 text-center">
            {activeSession && checkedItems.length > 0 ? (
              <>
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-base-content font-medium mb-1">All items in cart!</p>
                <p className="text-base-content/60 text-sm">Add more or finish shopping</p>
              </>
            ) : (
              <>
                <div className="text-4xl mb-3">📝</div>
                <p className="text-base-content/60">Your list is empty</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupItemsByCategory(uncheckedItems)).map(([categoryName, items]) => (
              <div key={categoryName}>
                {shouldGroupByCategory(uncheckedItems) && (
                  <h4 className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-2 px-1">
                    {categoryName}
                  </h4>
                )}
                <ul className="space-y-0 border-y border-base-300">
                  {items.map((item) => (
                    <ShoppingItem
                      key={item.id}
                      item={item}
                      isChecked={false}
                      showCheckbox={true}
                      onToggleCheck={activeSession ? () => toggleCheck(item, false) : undefined}
                      onDelete={deleteItem}
                      showCategoryLabel={shouldGroupByCategory(uncheckedItems)}
                      openMenuId={openMenuId}
                      onMenuToggle={setOpenMenuId}
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
        <div className="bg-base-200 border-t-4 border-base-300 p-4 pb-20 lg:pb-4">
          <h3 className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-3 px-1">
            In Cart ({checkedItems.length})
          </h3>

          <ul className="space-y-0 mb-4">
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
              />
            ))}
          </ul>

          {/* Done Shopping Button - Inline */}
          <div className="mt-4">
            <button
              onClick={finishSession}
              className="w-full btn btn-primary h-14 gap-2 text-base"
            >
              <CheckCircle width="20px" height="20px" strokeWidth={2} />
              Done Shopping
            </button>
            {uncheckedItems.length > 0 && (
              <p className="text-xs text-base-content/60 text-center mt-2 italic">
                {uncheckedItems.length} {uncheckedItems.length === 1 ? 'item' : 'items'} will stay for next trip
              </p>
            )}
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

      {/* Delete Item Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Item"
        message={
          itemToDelete ? (
            <>
              <p className="mb-3">
                Are you sure you want to delete <strong>{itemToDelete.name}</strong> from your shopping list?
              </p>
              <p className="text-sm text-base-content/60">
                Don&apos;t worry! You can always add it back from the catalog later.
              </p>
            </>
          ) : (
            'Are you sure you want to delete this item?'
          )
        }
        confirmText="Delete"
        severity="danger"
        isLoading={deleteItemMutation.isPending}
      />

      {/* Floating Action Button - Show when search is hidden */}
      {!showSearch && (
        <button
          onClick={handleFabClick}
          className="lg:hidden fixed bottom-20 right-4 z-30 btn btn-circle btn-accent btn-lg shadow-lg hover:shadow-xl"
          aria-label="Add item"
        >
          <Plus width="24px" height="24px" strokeWidth={2} />
        </button>
      )}
    </div>
  )
}
