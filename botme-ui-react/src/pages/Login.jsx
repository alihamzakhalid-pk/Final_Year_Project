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
  const { login, setUserDirect, signInWithGoogle, completeGoogleSignup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { showSuccess, showError } = useToast()
  const from = location.state?.from || '/dashboard'

  // Steps: 'form' | 'google_password'
  const [step, setStep] = useState('form')
  const [loading, setLoading] = useState(false)

  // Google OAuth state
  const [googleData, setGoogleData] = useState(null)
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
      const result = await signInWithGoogle(credentialResponse)

      if (result.user) {
        showSuccess('Logged in successfully!')
        setTimeout(() => {
          navigate('/dashboard', { replace: true })
        }, 500)
      } else if (result.new_user) {
        setGoogleData(result)
        setStep('google_password')
        showSuccess('Google account verified! Please set a password for your account.')
      }
    } catch (error) {
      console.error('[AUTH] Google login error:', error)
      showError(error?.message || 'Google login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    showError('Google login failed')
  }

  const handleGooglePasswordSubmit = async (e) => {
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

    try {
      setLoading(true)
      const data = await completeGoogleSignup({
        email: googleData.email,
        name: googleData.name,
        password: googlePassword,
        code: googleData.code, // BYPASS_OTP
        google_id: googleData.google_id
      })

      if (data?.user) {
        showSuccess('Account created successfully!')
        setTimeout(() => {
          navigate('/dashboard', { replace: true })
        }, 500)
      }
    } catch (error) {
      showError(error?.response?.data?.error || error?.message || 'Failed to complete signup')
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
              Sign in to access your conversations.
            </p>
          </div>

          {/* ====== STEP: FORM (Manual + Google) ====== */}
          {step === 'form' && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="continue_with"
                  logo_alignment="center"
                  width="100%"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-800 px-2 text-slate-500">OR</span>
                </div>
              </div>

              <AuthForm
                mode="login"
                onSubmit={async ({ email, password, identifier }) => {
                  try {
                    setLoading(true)
                    const data = await login({ email, identifier, password })
                    if (data?.user) {
                      showSuccess('Logged in successfully!')
                      navigate(from, { replace: true })
                    }
                  } catch (error) {
                    showError(error?.response?.data?.error || error?.message || 'Login failed')
                  } finally {
                    setLoading(false)
                  }
                }}
                disabled={loading}
              />
            </div>
          )}

          {/* ====== STEP: GOOGLE PASSWORD SETUP ====== */}
          {step === 'google_password' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E8F0FF] dark:bg-slate-700 mb-4">
                  <Lock className="h-8 w-8 text-[#5B7FFF]" />
                </div>
                <h2 className="text-2xl font-bold text-[#1F2937] dark:text-slate-100">Set your password</h2>
                <p className="text-sm text-[#6B7280] dark:text-slate-400">
                  Welcome, <span className="font-semibold">{googleData?.name || googleData?.email}</span>!
                  <br />
                  Create a password for your BotMe account.
                </p>
              </div>

              <form onSubmit={handleGooglePasswordSubmit} className="space-y-4">
                <UIInputField
                  label="Password"
                  type="password"
                  value={googlePassword}
                  onChange={(e) => {
                    setGooglePassword(e.target.value)
                    setPasswordError('')
                  }}
                  placeholder="••••••••"
                  required
                  icon={<Lock className="h-5 w-5 text-slate-400" />}
                />
                <UIInputField
                  label="Confirm password"
                  type="password"
                  value={googleConfirm}
                  onChange={(e) => {
                    setGoogleConfirm(e.target.value)
                    setPasswordError('')
                  }}
                  placeholder="••••••••"
                  required
                  icon={<ShieldCheck className="h-5 w-5 text-slate-400" />}
                />

                {passwordError && (
                  <div className="text-sm text-red-500 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border border-red-200">
                    {passwordError}
                  </div>
                )}

                <UIButton type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
                  {loading ? 'Setting up...' : 'Continue to Dashboard'}
                </UIButton>
              </form>
            </div>
          )}

          <p className="text-center text-sm text-[#6B7280] dark:text-slate-400 mt-6">
            New here?{' '}
            <Link
              to="/signup"
              className="font-semibold text-[#5B7FFF] hover:text-[#4A6BFF] transition-colors"
            >
              Get Started
            </Link>
          </p>
        </UICard>
      </motion.div>
    </div>
  )
}
