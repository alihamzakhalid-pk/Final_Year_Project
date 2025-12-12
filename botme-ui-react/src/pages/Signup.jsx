import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Mail } from 'lucide-react'
import AuthForm from '../components/AuthForm'
import VerificationCodeInput from '../components/VerificationCodeInput'
import UICard from '../components/ui/Card'
import UIButton from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/ui/Toast'

export default function Signup() {
  const { signup, verifySignup, oauthLogin } = useAuth()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const [step, setStep] = useState('form') // 'form' or 'verify'
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSocialSignup = async (provider) => {
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
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4">
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
              Create your BotMe account
            </motion.h1>
            <p className="text-sm text-[#6B7280] dark:text-slate-400">
              We'll tailor insights and conversations based on your uploads.
            </p>
          </div>

          {/* Social Auth Buttons */}
          <div className="space-y-3 mb-6">
            <UIButton
              variant="outline"
              className="w-full justify-center gap-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-[#1F2937] dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              onClick={() => handleSocialSignup('Google')}
              disabled={loading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </UIButton>
            <UIButton
              variant="outline"
              className="w-full justify-center gap-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-[#1F2937] dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              onClick={() => handleSocialSignup('Facebook')}
              disabled={loading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </UIButton>
            <UIButton
              variant="outline"
              className="w-full justify-center gap-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-[#1F2937] dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              onClick={() => handleSocialSignup('Microsoft')}
              disabled={loading}
            >
              <svg className="h-5 w-5" viewBox="0 0 23 23">
                <path fill="#f25022" d="M0 0h11v11H0z"/>
                <path fill="#00a4ef" d="M12 0h11v11H12z"/>
                <path fill="#7fba00" d="M0 12h11v11H0z"/>
                <path fill="#ffb900" d="M12 12h11v11H12z"/>
              </svg>
              Continue with Microsoft
            </UIButton>
            <UIButton
              variant="outline"
              className="w-full justify-center gap-3 rounded-xl border-2 border-black bg-black text-white hover:bg-slate-900 transition-colors"
              onClick={() => handleSocialSignup('Apple')}
              disabled={loading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Continue with Apple
            </UIButton>
            <UIButton
              variant="outline"
              className="w-full justify-center gap-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-[#1F2937] dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              onClick={() => handleSocialSignup('GitHub')}
              disabled={loading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
              </svg>
              Continue with GitHub
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

          {step === 'form' ? (
            /* Email Signup Form */
            <AuthForm
              mode="signup"
              onSubmit={async ({ fullName, email, password }) => {
                try {
                  setLoading(true)
                  const data = await signup({ fullName, email, password })
                  setEmail(email)
                  setStep('verify')
                  showSuccess('Verification code sent to your email!')
                } catch (error) {
                  showError(error?.message || 'Failed to send verification code. Please try again.')
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
                    await verifySignup({ email, code })
                    showSuccess('Account created successfully! Redirecting to dashboard...')
                    setTimeout(() => {
                      navigate('/dashboard', { replace: true })
                    }, 1200)
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
                  Back to signup form
                </button>
                <p className="text-xs text-[#6B7280] dark:text-slate-400">
                  Didn't receive the code? Check your spam folder or{' '}
                  <button
                    onClick={async () => {
                      try {
                        setLoading(true)
                        // Resend code - we need to get the form data again
                        // For now, just show a message
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

          <p className="text-center text-sm text-[#6B7280] dark:text-slate-400 mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-[#5B7FFF] hover:text-[#4A6BFF] transition-colors"
            >
              Log in
            </Link>
          </p>
        </UICard>
      </motion.div>
    </div>
  )
}
