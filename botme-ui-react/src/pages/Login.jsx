import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Lock, ShieldCheck } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import AuthForm from '../components/AuthForm'
import UICard from '../components/ui/Card'
import UIButton from '../components/ui/Button'
import UIInputField from '../components/ui/InputField'
import PasswordStrength from '../components/ui/PasswordStrength'
import VerificationCodeInput from '../components/VerificationCodeInput'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/ui/Toast'
import api from '../api/axios'

export default function Login() {
  const { login, setUserDirect } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { showSuccess, showError } = useToast()
  const from = location.state?.from || '/dashboard'

  // Steps: 'form' | 'google_password' | 'google_verify'
  const [step, setStep] = useState('form')
  const [loading, setLoading] = useState(false)

  // Google OAuth state
  const [googleEmail, setGoogleEmail] = useState('')
  const [googleName, setGoogleName] = useState('')
  const [googlePassword, setGooglePassword] = useState('')
  const [googleConfirm, setGoogleConfirm] = useState('')
  const [passwordError, setPasswordError] = useState('')

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

      console.log('[OAUTH] Sending Google ID token to backend...')
      const { data } = await api.post('/api/oauth/google/id-token', { token })

      console.log('[OAUTH] Backend response:', { new_user: data?.new_user })

      if (data?.new_user === true) {
        // New user → show password setup step
        console.log('[OAUTH] New user detected, showing password setup')
        setGoogleEmail(data.email || '')
        setGoogleName(data.name || '')
        setStep('google_password')
        showSuccess('Google account verified! Please set a password for your account.')
        if (data?.devMode && data?.code) {
          showSuccess(`Dev mode - Verification code: ${data.code}`)
        }
      } else {
        // Existing user → logged in directly
        console.log('[OAUTH] Existing user, redirecting to dashboard')
        if (data?.user) {
          setUserDirect(data.user)
        }
        showSuccess('Logged in successfully!')
        setTimeout(() => {
          navigate('/dashboard', { replace: true })
        }, 500)
      }
    } catch (error) {
      console.error('[OAUTH] Google login error:', error)
      showError(error?.message || error?.data?.error || 'Google login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    console.error('[OAUTH] Google login dismissed')
    showError('Google login cancelled')
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    setPasswordError('')

    if (!googlePassword || googlePassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }
    if (googlePassword !== googleConfirm) {
      setPasswordError('Passwords do not match')
      return
    }

    // Move to verification code step
    setStep('google_verify')
    showSuccess('Now enter the verification code sent to your email.')
  }

  const handleVerifyComplete = async (code) => {
    try {
      setLoading(true)
      const { data } = await api.post('/api/oauth/google/complete-signup', {
        email: googleEmail,
        code: code.trim(),
        password: googlePassword
      })
      if (data?.user) {
        setUserDirect(data.user)
        showSuccess('Account created successfully! Redirecting to dashboard...')
        setTimeout(() => {
          navigate('/dashboard', { replace: true })
        }, 800)
      }
    } catch (error) {
      console.error('[OAUTH] Verification error:', error)
      showError(error?.message || error?.data?.error || 'Invalid verification code. Please try again.')
    } finally {
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

          {/* ====== STEP: FORM (default login) ====== */}
          {step === 'form' && (
            <>
              {/* Google OAuth Button */}
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
                  } catch (error) {
                    showError(error?.response?.data?.error || error?.message || 'Login failed')
                  } finally {
                    setLoading(false)
                  }
                }}
                disabled={loading}
              />
            </>
          )}

          {/* ====== STEP: GOOGLE PASSWORD SETUP (new users) ====== */}
          {step === 'google_password' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E8F0FF] dark:bg-slate-700 mb-4"
                >
                  <Lock className="h-8 w-8 text-[#5B7FFF]" />
                </motion.div>
                <h2 className="text-2xl font-bold text-[#1F2937] dark:text-slate-100">Set your password</h2>
                <p className="text-sm text-[#6B7280] dark:text-slate-400">
                  Welcome, <span className="font-semibold text-[#1F2937] dark:text-slate-200">{googleName || googleEmail}</span>!
                  <br />
                  Create a password for your BotMe account.
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <UIInputField
                  label="Password"
                  type="password"
                  value={googlePassword}
                  onChange={(e) => {
                    setGooglePassword(e.target.value)
                    setPasswordError('')
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  icon={<Lock className="h-5 w-5 text-slate-400" />}
                />
                {googlePassword && <PasswordStrength password={googlePassword} />}

                <UIInputField
                  label="Confirm password"
                  type="password"
                  value={googleConfirm}
                  onChange={(e) => {
                    setGoogleConfirm(e.target.value)
                    setPasswordError('')
                  }}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  required
                  icon={<ShieldCheck className="h-5 w-5 text-slate-400" />}
                />

                {passwordError && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-4 py-3 text-sm text-red-700 dark:text-red-300"
                  >
                    {passwordError}
                  </motion.div>
                )}

                <UIButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-2"
                  disabled={loading}
                >
                  Continue
                </UIButton>
              </form>

              <div className="text-center">
                <button
                  onClick={() => {
                    setStep('form')
                    setGooglePassword('')
                    setGoogleConfirm('')
                    setPasswordError('')
                  }}
                  className="text-sm text-[#6B7280] dark:text-slate-400 hover:text-[#5B7FFF]"
                  disabled={loading}
                >
                  Back to login
                </button>
              </div>
            </div>
          )}

          {/* ====== STEP: GOOGLE VERIFY (enter email code) ====== */}
          {step === 'google_verify' && (
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
                onComplete={handleVerifyComplete}
                disabled={loading}
              />

              <div className="text-center space-y-3">
                <button
                  onClick={() => setStep('google_password')}
                  className="mx-auto text-sm text-[#6B7280] dark:text-slate-400 hover:text-[#5B7FFF]"
                  disabled={loading}
                >
                  Back to password setup
                </button>
                <p className="text-xs text-[#6B7280] dark:text-slate-400">
                  Didn't receive the code? Check your spam folder.
                </p>
              </div>
            </div>
          )}

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
