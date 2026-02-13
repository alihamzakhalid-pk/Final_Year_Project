import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const { data } = await api.get('/api/me') // Connect to backend profile endpoint here
        if (data && data.user) {
          setUser(data.user)
        } else if (data?.email) {
          setUser(data)
        }
      } catch (error) {
        localStorage.removeItem('auth_token')
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
  }, [])

  const login = async ({ email, password, identifier }) => {
    const { data } = await api.post('/api/login', {
      email: email || identifier,
      identifier: identifier || email,
      password
    })
    // Handle direct login response
    if (data?.user) {
      const token = data?.token || 'session'
      localStorage.setItem('auth_token', token)
      setUser(data.user)
    }
    return data
  }



  const signup = async ({ fullName, email, password }) => {
    const { data } = await api.post('/api/signup', { fullName, email, password })
    return data
  }

  const verifySignup = async ({ email, code }) => {
    const { data } = await api.post('/api/verify-signup', { email, code })
    const token = data?.token || data?.accessToken || 'demo-auth-token'
    localStorage.setItem('auth_token', token)
    if (data?.user) {
      setUser(data.user)
    }
    return data
  }

  const logout = async () => {
    setUser(null)
    localStorage.removeItem('auth_token')
    try {
      await api.post('/api/logout') // Optional: notify backend about logout when available
    } catch (error) {
      // Ignore placeholder errors until backend wiring exists
    }
  }

  const requestPasswordReset = async (email) => {
    if (!email) throw new Error('Email is required')
    const { data } = await api.post('/api/request-password-reset', { email })
    return data
  }

  const resetPassword = async ({ email, code, newPassword }) => {
    const { data } = await api.post('/api/reset-password', { email, code, new_password: newPassword })
    const token = data?.token || 'session'
    localStorage.setItem('auth_token', token)
    if (data?.user) {
      setUser(data.user)
    }
    return data
  }

  const oauthLogin = async (provider) => {
    try {
      const { data } = await api.get(`/api/oauth/${provider}`)
      if (data?.auth_url) {
        // Redirect to OAuth provider
        window.location.href = data.auth_url
      } else {
        throw new Error(data?.error || 'Failed to get OAuth URL')
      }
    } catch (error) {
      // Handle different error formats
      const errorMessage = error?.data?.error || error?.response?.data?.error || error?.message || `Failed to initiate ${provider} login`
      throw new Error(errorMessage)
    }
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      login,

      signup,
      verifySignup,
      logout,
      oauthLogin,
      requestPasswordReset,
      resetPassword,
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}


