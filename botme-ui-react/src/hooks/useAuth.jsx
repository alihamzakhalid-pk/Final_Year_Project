import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api, { baseURL } from '../api/axios'

// ... existing code ...



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
    if (data?.user) {
      const token = data?.token || 'session'
      localStorage.setItem('auth_token', token)
      setUser(data.user)
    }
    return data
  }

  const verifySignup = async ({ email, code }) => {
    // DEPRECATED but kept for compatibility
    return { success: true }
  }

  const logout = async () => {
    setUser(null)
    localStorage.removeItem('auth_token')
    try {
      await api.post('/api/logout') // Optional: notify backend about logout when available
    } catch (error) {
      // Ignore
    }
  }

  const setUserDirect = (userData) => {
    if (userData) {
      localStorage.setItem('auth_token', 'session')
      setUser(userData)
    }
  }

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/api/me')
      if (data && data.user) {
        setUser(data.user)
        console.log('[AUTH] User refreshed:', data.user)
      }
    } catch (error) {
      console.error('[AUTH] Failed to refresh user:', error)
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

  const oauthLogin = (provider) => {
    // Redirect to backend OAuth login endpoint
    window.location.href = `${baseURL}/api/oauth/${provider}/login`
  }

  const signInWithGoogle = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential
      const { data } = await api.post('/api/oauth/google/id-token', { token })

      if (data?.user) {
        setUserDirect(data.user)
        return { user: data.user }
      } else if (data?.new_user) {
        return {
          new_user: true,
          email: data.email,
          name: data.name,
          google_id: data.google_id,
          code: data.code // BYPASS_OTP from backend
        }
      }
    } catch (error) {
      console.error('[AUTH] Google Sign-in Error:', error)
      throw error
    }
  }

  const completeGoogleSignup = async ({ email, password, name, code, google_id }) => {
    const { data } = await api.post('/api/oauth/google/complete-signup', {
      email,
      password,
      name,
      code,
      google_id
    })
    if (data?.user) {
      setUserDirect(data.user)
    }
    return data
  }


  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      verifySignup,
      logout,
      refreshUser,
      oauthLogin,
      setUserDirect,
      requestPasswordReset,
      resetPassword,
      signInWithGoogle,
      completeGoogleSignup,
    }),
    [user, loading],
  )



  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}


