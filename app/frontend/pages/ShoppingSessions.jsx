import { useState } from 'react'
import { useSessions, useDeleteSession } from '../hooks/queries/useShoppingQueries'
import SessionListItem from '../components/shopping/SessionListItem'
import SessionDetailsModal from '../components/shopping/SessionDetailsModal'
import ConfirmationModal from '../components/common/ConfirmationModal'

export default function ShoppingSessions() {
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState(null)

  // Fetch all sessions
  const {
    data: sessions = [],
    isLoading,
    error,
    refetch,
  } = useSessions()

  // Mutation for deleting a session
  const deleteSessionMutation = useDeleteSession()

  const deleteSession = (sessionId) => {
    const session = sessions.find(s => s.id === sessionId)
    setSessionToDelete(session)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = () => {
    if (!sessionToDelete) return

    deleteSessionMutation.mutate(sessionToDelete.id, {
      onSuccess: () => {
        setShowDeleteModal(false)
        setSessionToDelete(null)
      },
      onError: (err) => {
        alert(`Error: ${err.message}`)
      },
    })
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setSessionToDelete(null)
  }

  const handleEdit = (session) => {
    // Show details modal for all sessions
    setSelectedSession(session)
    setDetailsModalOpen(true)
  }

  const handleModalClose = () => {
    setDetailsModalOpen(false)
    setSelectedSession(null)
  }

  if (isLoading) {
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
            onClick={() => refetch()}
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
        <h1 className="text-lg font-semibold">Shopping History</h1>
        {sessions.length > 0 && (
          <p className="text-xs text-base-content/60 mt-0.5">
            {sessions.length} {sessions.length === 1 ? 'trip' : 'trips'} recorded
          </p>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="p-4">
          <div className="py-16 text-center">
            <div className="text-5xl mb-4">🛒</div>
            <p className="text-base-content font-medium mb-2">No shopping history yet</p>
            <p className="text-base-content/60 text-sm">
              Completed trips will appear here
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4">
          {/* Timeline */}
          <div className="relative">
            {sessions.map((session, index) => (
              <SessionListItem
                key={session.id}
                session={session}
                onDelete={deleteSession}
                onEdit={handleEdit}
                isLast={index === sessions.length - 1}
              />
            ))}
          </div>
        </div>
      )}

      {/* Session Details Modal */}
      <SessionDetailsModal
        isOpen={detailsModalOpen}
        onClose={handleModalClose}
        session={selectedSession}
      />

      {/* Delete Session Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Shopping Trip"
        message={
          sessionToDelete ? (
            <>
              <p className="mb-3">
                Are you sure you want to delete <strong>{sessionToDelete.name}</strong>?
              </p>
              <p className="text-sm text-base-content/60 mb-2">
                This will permanently remove:
              </p>
              <ul className="text-sm text-base-content/60 list-disc list-inside space-y-1 mb-3">
                <li>All purchased items from this trip</li>
                <li>Shopping history and timestamps</li>
              </ul>
              <p className="text-sm font-medium text-warning">
                ⚠️ This action cannot be undone.
              </p>
            </>
          ) : (
            'Are you sure you want to delete this shopping trip?'
          )
        }
        confirmText="Delete"
        severity="danger"
        isLoading={deleteSessionMutation.isPending}
      />
    </div>
  )
}
