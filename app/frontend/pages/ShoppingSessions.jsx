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
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <p>Loading sessions...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <p className="text-red-600 mb-3">Error: {error.message}</p>
        <button
          onClick={() => refetch()}
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
        <h1 className="text-3xl font-bold mb-2">Past Shopping Trips</h1>
        <p className="text-gray-600 text-sm">Your shopping history</p>
      </div>

      {sessions.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-4">No trips yet!</p>
          <p className="text-gray-500 text-sm">
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
      <div className="mt-5 p-4 bg-blue-50 rounded-lg">
        <p className="m-0 text-sm">
          <strong>Total trips:</strong> {sessions.length}
        </p>
      </div>
    </div>
  )
}
