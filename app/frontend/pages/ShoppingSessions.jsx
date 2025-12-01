import { useState } from 'react'
import { useSessions, useDeleteSession } from '../hooks/queries/useShoppingQueries'
import SessionListItem from '../components/shopping/SessionListItem'
import SessionDetailsModal from '../components/shopping/SessionDetailsModal'

export default function ShoppingSessions() {
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)

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
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) return

    deleteSessionMutation.mutate(sessionId, {
      onError: (err) => alert(`Error: ${err.message}`),
    })
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
    </div>
  )
}
