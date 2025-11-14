import { createContext, useContext } from 'react'
import { useUserQuery } from '../hooks/useUserQuery'
import { useLoginMutation, useLogoutMutation } from '../hooks/useAuthMutations'
import { hasValidTokens } from '../utils/tokenStorage'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  // React Query handles user data fetching and caching
  const {
    data: user,
    isLoading: isLoadingUser,
  } = useUserQuery()

  // Mutations for login/logout
  const loginMutation = useLoginMutation()
  const logoutMutation = useLogoutMutation()

  // Note: We don't handle userError here
  // api.js automatically handles token refresh on 401
  // If refresh fails, api.js clears tokens and query will be disabled (hasValidTokens() = false)

  const login = async (email, password) => {
    const userData = await loginMutation.mutateAsync({ email, password })
    return userData
  }

  const logout = async () => {
    await logoutMutation.mutateAsync()
  }

  const value = {
    user: user || null,
    login,
    logout,
    loading: isLoadingUser,
    isAuthenticated: !!user && hasValidTokens(),
    // Expose mutation states for advanced usage
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
