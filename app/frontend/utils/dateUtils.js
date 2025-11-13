/**
 * Date and time utilities
 */

/**
 * Format a date as a relative time string
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time (e.g., "2 hours ago", "just now")
 */
export function formatTimeAgo(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600)
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  }
  if (seconds < 604800) {
    const days = Math.floor(seconds / 86400)
    return `${days} ${days === 1 ? 'day' : 'days'} ago`
  }
  const weeks = Math.floor(seconds / 604800)
  return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
}
