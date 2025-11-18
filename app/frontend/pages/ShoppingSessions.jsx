import { useSessions, useDeleteSession } from '../hooks/queries/useShoppingQueries'
import SessionListItem from '../components/shopping/SessionListItem'

export default function ShoppingSessions() {
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

  const handleViewDetails = (_sessionId) => {
    // TODO: Navigate to session details page
    alert('Session details view coming soon!')
  }

  if (isLoading) {
    return (
      <div className="card bg-base-100 p-8 shadow-sm">
        <p>Loading sessions...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card bg-base-100 p-8 shadow-sm">
        <p className="text-error mb-3">Error: {error.message}</p>
        <button
          onClick={() => refetch()}
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
        <h1 className="text-3xl font-bold mb-2">Past Shopping Trips</h1>
        <p className="text-base-content/70 text-sm">Your shopping history</p>
      </div>

      {sessions.length === 0 ? (
        <div className="p-8 text-center bg-base-200 rounded-lg border-2 border-dashed border-base-300">
          <p className="text-base-content mb-4">No trips yet!</p>
          <p className="text-base-content/70 text-sm">
            Your completed shopping trips will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <SessionListItem
              key={session.id}
              session={session}
              onDelete={deleteSession}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-5 stats shadow bg-primary/10">
        <div className="stat">
          <div className="stat-title">Total trips</div>
          <div className="stat-value text-primary">{sessions.length}</div>
        </div>
      </div>
    </div>
  )
}
