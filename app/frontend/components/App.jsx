import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { FlashProvider } from '../contexts/FlashContext'
import Login from '../pages/Login'
import Layout from '../layouts/Layout'
import Backlog from '../pages/Backlog'
import ShoppingSessions from '../pages/ShoppingSessions'
import Catalog from '../pages/Catalog'
import CatalogCategories from '../pages/CatalogCategories'
import CatalogItems from '../pages/CatalogItems'
import ProtectedRoute from './ProtectedRoute'

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Backlog />} />
        <Route path="/shopping/sessions" element={<ShoppingSessions />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/catalog/categories" element={<CatalogCategories />} />
        <Route path="/catalog/categories/:categoryId/items" element={<CatalogItems />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <FlashProvider>
          <AppRoutes />
        </FlashProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
