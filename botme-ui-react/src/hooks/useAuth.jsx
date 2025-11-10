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
    return data
  }

  const verifyLogin = async ({ email, code }) => {
    const { data } = await api.post('/api/verify-login', { email, code })
    const token = data?.token || data?.accessToken || 'demo-auth-token'
    localStorage.setItem('auth_token', token)
    if (data?.user) {
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

  const value = useMemo(() => ({ user, loading, login, verifyLogin, signup, verifySignup, logout }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}


