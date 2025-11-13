import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <nav style={{
        backgroundColor: 'white',
        padding: '1rem 2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Rollingcart</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#666' }}>{user?.email || 'Loading...'}</span>
          <button
            onClick={logout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <main style={{ padding: '2rem' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h2 style={{ marginTop: 0 }}>Welcome to Rollingcart!</h2>
          <p>You are logged in as: <strong>{user?.email}</strong></p>
          <p style={{ color: '#888', fontSize: '0.875rem' }}>Account ID: {user?.id}</p>
          <p style={{ color: '#666' }}>
            This is your dashboard. Start building your features here.
          </p>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
