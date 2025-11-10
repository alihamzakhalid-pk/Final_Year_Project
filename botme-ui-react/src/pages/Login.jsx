import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Chrome, Apple, Mail, ArrowLeft } from 'lucide-react'
import AuthForm from '../components/AuthForm'
import VerificationCodeInput from '../components/VerificationCodeInput'
import UICard from '../components/ui/Card'
import UIButton from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/ui/Toast'

export default function Login() {
  const { login, verifyLogin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { showSuccess, showError } = useToast()
  const from = location.state?.from || '/dashboard'
  const [step, setStep] = useState('form') // 'form' or 'verify'
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSocialLogin = (provider) => {
    showError(`${provider} authentication is coming soon!`)
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <UICard className="rounded-2xl bg-white p-8 shadow-lg border border-slate-200">
          <div className="space-y-2 text-center mb-6">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-bold text-[#1F2937]"
            >
              Welcome back
            </motion.h1>
            <p className="text-sm text-[#6B7280]">
              Enter your credentials to access your conversations and dashboards.
            </p>
          </div>

          {/* Social Auth Buttons */}
          <div className="space-y-3 mb-6">
            <UIButton
              variant="outline"
              className="w-full justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-[#1F2937] hover:border-red-500 hover:bg-red-50 transition-colors"
              onClick={() => handleSocialLogin('Google')}
            >
              <Chrome className="h-5 w-5 text-red-500" />
              Continue with Google
            </UIButton>
            <UIButton
              variant="outline"
              className="w-full justify-center gap-2 rounded-xl border-2 border-black bg-black text-white hover:bg-slate-900 transition-colors"
              onClick={() => handleSocialLogin('Apple')}
            >
              <Apple className="h-5 w-5" />
              Continue with Apple
            </UIButton>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-[#6B7280]">OR</span>
            </div>
          </div>

          {step === 'form' ? (
            /* Email Login Form */
            <AuthForm
              mode="login"
              onSubmit={async ({ email, password, identifier }) => {
                try {
                  setLoading(true)
                  const data = await login({ email, identifier, password })
                  // Extract email from response or use the input
                  const userEmail = data?.email || email || identifier
                  setEmail(userEmail)
                  setStep('verify')
                  showSuccess('Verification code sent to your email!')
                } catch (error) {
                  showError(error?.message || 'Login failed. Please try again.')
                } finally {
                  setLoading(false)
                }
              }}
              disabled={loading}
            />
          ) : (
            /* Verification Step */
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E8F0FF] mb-4"
                >
                  <Mail className="h-8 w-8 text-[#5B7FFF]" />
                </motion.div>
                <h2 className="text-2xl font-bold text-[#1F2937]">Check your email</h2>
                <p className="text-sm text-[#6B7280]">
                  We've sent a 6-digit verification code to
                  <br />
                  <span className="font-semibold text-[#1F2937]">{email}</span>
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
                  className="text-sm text-[#6B7280] hover:text-[#5B7FFF] flex items-center justify-center gap-2 mx-auto"
                  disabled={loading}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login form
                </button>
                <p className="text-xs text-[#6B7280]">
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

          <p className="text-center text-sm text-[#6B7280] mt-6">
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
