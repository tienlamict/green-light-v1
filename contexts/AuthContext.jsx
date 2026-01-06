'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in on mount
    // Must have both token and user data to be considered authenticated
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('admin_user')
    
    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        // Invalid user data, clear everything
        localStorage.removeItem('admin_user')
        localStorage.removeItem('auth_token')
      }
    } else {
      // Missing token or user data, clear everything
      if (storedUser) localStorage.removeItem('admin_user')
      if (storedToken) localStorage.removeItem('auth_token')
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      // Call real API login
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Login failed')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        const { token, user: userData } = result.data
        
        // Save token and user data
        localStorage.setItem('auth_token', token)
        localStorage.setItem('admin_user', JSON.stringify(userData))
        
        setUser(userData)
        return { success: true }
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('admin_user')
    localStorage.removeItem('auth_token')
    setUser(null)
    router.push('/admin/login')
  }

  // Handle 401 unauthorized errors - auto logout
  const handleUnauthorized = () => {
    console.warn('Unauthorized access detected, logging out...')
    logout()
  }

  // Check both user and token exist for authentication
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  const isAuthenticated = !!(user && token)

  const value = {
    user,
    login,
    logout,
    handleUnauthorized,
    isAuthenticated,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

