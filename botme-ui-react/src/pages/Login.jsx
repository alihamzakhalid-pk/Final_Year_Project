import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import AuthForm from '../components/AuthForm'
import UICard from '../components/ui/Card'
import UIButton from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/ui/Toast'

export default function Login() {
  const { login, oauthLogin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { showSuccess, showError } = useToast()
  const from = location.state?.from || '/dashboard'
  const [loading, setLoading] = useState(false)

  // Handle OAuth callback
  useEffect(() => {
    const oauthSuccess = searchParams.get('oauth_success')
    const oauthError = searchParams.get('oauth_error')
    const provider = searchParams.get('provider')

    if (oauthSuccess === 'true') {
      showSuccess(`Successfully signed in with ${provider || 'OAuth'}!`)
      // Refresh user data
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1000)
    } else if (oauthError) {
      showError(`OAuth error: ${oauthError}`)
    }
  }, [searchParams, showSuccess, showError])

  const handleSocialLogin = async (provider) => {
    try {
      setLoading(true)
      const providerLower = provider.toLowerCase()
      await oauthLogin(providerLower)
      // The redirect will happen automatically
    } catch (error) {
      showError(error?.message || `Failed to sign in with ${provider}. Please try again.`)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 bg-[#F8FAFC] dark:bg-slate-900 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <UICard className="rounded-2xl bg-white dark:bg-slate-800 p-8 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="space-y-2 text-center mb-6">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-bold text-[#1F2937] dark:text-slate-100"
            >
              Welcome back
            </motion.h1>
            <p className="text-sm text-[#6B7280] dark:text-slate-400">
              Enter your credentials to access your conversations and dashboards.
            </p>
          </div>

          {/* Social Auth Button - Google Only */}
          <div className="mb-6">
            <UIButton
              variant="outline"
              className="w-full flex items-center justify-center gap-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-[#1F2937] dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              onClick={() => handleSocialLogin('Google')}
              disabled={loading}
            >
              <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Continue with Google</span>
            </UIButton>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-800 px-2 text-[#6B7280] dark:text-slate-400">OR</span>
            </div>
          </div>

          {/* Email Login Form */}
          <AuthForm
            mode="login"
            onSubmit={async ({ email, password, identifier }) => {
              try {
                setLoading(true)
                const data = await login({ email, identifier, password })
                if (data?.user) {
                  showSuccess('Logged in successfully!')
                  navigate(from, { replace: true })
                } else {
                  showError('Login failed. Unexpected response from server.')
                }
              } catch (error) {
                showError(error?.message || 'Login failed. Please check your credentials and try again.')
              } finally {
                setLoading(false)
              }
            }}
            disabled={loading}
          />

          <p className="text-center text-sm text-[#6B7280] dark:text-slate-400 mt-6">
            New here?{' '}
            <Link
              to="/signup"
              className="font-semibold text-[#5B7FFF] hover:text-[#4A6BFF] transition-colors"
            >
              Create an account
            </Link>
          </p>
        </UICard>
      </motion.div>
    </div>
  )
}
