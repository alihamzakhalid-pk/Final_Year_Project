import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
<<<<<<< HEAD
import { Mail } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
=======
>>>>>>> fd28afaa34a6b3ca12c30b0ca85f5283dd59e554
import AuthForm from '../components/AuthForm'
import UICard from '../components/ui/Card'
import UIButton from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/ui/Toast'
import api from '../api/axios'

export default function Login() {
<<<<<<< HEAD
  const { login, verifyLogin } = useAuth()
=======
  const { login, oauthLogin } = useAuth()
>>>>>>> fd28afaa34a6b3ca12c30b0ca85f5283dd59e554
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { showSuccess, showError } = useToast()
  const from = location.state?.from || '/dashboard'
<<<<<<< HEAD
  const [step, setStep] = useState('form') // 'form' or 'verify' or 'google_verify'
  const [email, setEmail] = useState('')
  const [googleEmail, setGoogleEmail] = useState('')
=======
>>>>>>> fd28afaa34a6b3ca12c30b0ca85f5283dd59e554
  const [loading, setLoading] = useState(false)

  // Handle OAuth callback (if coming from old redirect flow)
  useEffect(() => {
    const oauthSuccess = searchParams.get('oauth_success')
    if (oauthSuccess === 'true') {
      showSuccess('Successfully signed in!')
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 500)
    }
  }, [searchParams, showSuccess])

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true)
      const token = credentialResponse.credential

      // Send JWT token to backend
      const { data } = await api.post('/api/oauth/google/callback', { token })

      if (data?.requiresVerification) {
        // New user - show verification step
        setGoogleEmail(data.email)
        setStep('google_verify')
        showSuccess('Verification code sent to your email!')
        // In dev mode, show the code
        if (data?.devMode && data?.code) {
          showSuccess(`Dev mode - Code: ${data.code}`)
        }
      } else if (data?.user) {
        // Existing user - login directly
        showSuccess('Logged in successfully!')
        setTimeout(() => {
          navigate(from, { replace: true })
        }, 500)
      }
    } catch (error) {
      console.error('Google login error:', error)
      showError(error?.response?.data?.error || error?.message || 'Google login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    showError('Google login failed. Please try again.')
    setLoading(false)
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

          {/* Google OAuth Button - New Popup Method */}
          <div className="mb-6">
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                text="signin_with"
                logo_alignment="center"
              />
            </div>
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
<<<<<<< HEAD
              }}
              disabled={loading}
            />
          ) : step === 'google_verify' ? (
            /* Google OAuth Verification Step */
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E8F0FF] dark:bg-slate-700 mb-4"
                >
                  <Mail className="h-8 w-8 text-[#5B7FFF]" />
                </motion.div>
                <h2 className="text-2xl font-bold text-[#1F2937] dark:text-slate-100">Verify your email</h2>
                <p className="text-sm text-[#6B7280] dark:text-slate-400">
                  We've sent a 6-digit code to
                  <br />
                  <span className="font-semibold text-[#1F2937] dark:text-slate-200">{googleEmail}</span>
                </p>
              </div>

              <VerificationCodeInput
                length={6}
                onComplete={async (code) => {
                  try {
                    setLoading(true)
                    const { data } = await api.post('/api/oauth/verify-signup', {
                      email: googleEmail,
                      code
                    })
                    if (data?.user) {
                      // Store token
                      localStorage.setItem('auth_token', data.token || 'session')
                      showSuccess('Account created successfully! Redirecting to dashboard...')
                      setTimeout(() => {
                        window.location.href = '/dashboard'
                      }, 500)
                    }
                  } catch (error) {
                    showError(error?.response?.data?.error || 'Invalid verification code. Please try again.')
                  } finally {
                    setLoading(false)
                  }
                }}
                disabled={loading}
              />

              <div className="text-center space-y-3">
                <button
                  onClick={() => setStep('form')}
                  className="mx-auto text-sm text-[#6B7280] dark:text-slate-400 hover:text-[#5B7FFF]"
                  disabled={loading}
                >
                  Back to login form
                </button>
              </div>
            </div>
          ) : (
            /* Email Verification Step */
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E8F0FF] dark:bg-slate-700 mb-4"
                >
                  <Mail className="h-8 w-8 text-[#5B7FFF]" />
                </motion.div>
                <h2 className="text-2xl font-bold text-[#1F2937] dark:text-slate-100">Check your email</h2>
                <p className="text-sm text-[#6B7280] dark:text-slate-400">
                  We've sent a 6-digit verification code to
                  <br />
                  <span className="font-semibold text-[#1F2937] dark:text-slate-200">{email}</span>
                </p>
              </div>

              <VerificationCodeInput
                length={6}
                onComplete={async (code) => {
                  try {
                    setLoading(true)
                    await verifyLogin({ email, code })
                    showSuccess('Logged in successfully!')
                    navigate(from, { replace: true })
                  } catch (error) {
                    showError(error?.message || 'Invalid verification code. Please try again.')
                  } finally {
                    setLoading(false)
                  }
                }}
                disabled={loading}
              />

              <div className="text-center space-y-3">
                <button
                  onClick={() => setStep('form')}
                  className="mx-auto text-sm text-[#6B7280] dark:text-slate-400 hover:text-[#5B7FFF]"
                  disabled={loading}
                >
                  Back to login form
                </button>
                <p className="text-xs text-[#6B7280] dark:text-slate-400">
                  Didn't receive the code? Check your spam folder or{' '}
                  <button
                    onClick={async () => {
                      try {
                        setLoading(true)
                        showError('Please go back and submit the form again to resend the code.')
                      } catch (error) {
                        showError('Failed to resend code. Please try again.')
                      } finally {
                        setLoading(false)
                      }
                    }}
                    className="text-[#5B7FFF] hover:underline"
                    disabled={loading}
                  >
                    resend
                  </button>
                </p>
              </div>
            </div>
          )}
=======
              } catch (error) {
                showError(error?.message || 'Login failed. Please check your credentials and try again.')
              } finally {
                setLoading(false)
              }
            }}
            disabled={loading}
          />
>>>>>>> fd28afaa34a6b3ca12c30b0ca85f5283dd59e554

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
