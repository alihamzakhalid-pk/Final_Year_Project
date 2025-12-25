import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ShieldCheck, Lock } from 'lucide-react'
import UICard from '../components/ui/Card'
import UIInputField from '../components/ui/InputField'
import UIButton from '../components/ui/Button'
import PasswordStrength from '../components/ui/PasswordStrength'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/ui/Toast'

export default function ForgotPassword() {
  const { requestPasswordReset, resetPassword } = useAuth()
  const { showError, showSuccess } = useToast()
  const navigate = useNavigate()
  const [step, setStep] = useState('request') // request -> verify
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRequest = async (event) => {
    event.preventDefault()
    try {
      setLoading(true)
      await requestPasswordReset(email)
      setStep('verify')
      showSuccess('If an account exists, a reset code was sent to your email.')
    } catch (error) {
      showError(error?.message || 'Unable to send reset code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (event) => {
    event.preventDefault()
    if (password !== confirm) {
      showError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      showError('Password must be at least 8 characters long.')
      return
    }
    try {
      setLoading(true)
      await resetPassword({ email, code, newPassword: password })
      showSuccess('Password updated. You are now signed in.')
      navigate('/dashboard')
    } catch (error) {
      showError(error?.message || 'Reset failed. Check your code and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 dark:bg-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
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
              {step === 'request' ? 'Forgot password?' : 'Enter reset code'}
            </motion.h1>
            <p className="text-sm text-[#6B7280] dark:text-slate-400">
              {step === 'request'
                ? 'We will email you a 6-digit code to reset your password.'
                : 'Check your inbox for the code and set a new password.'}
            </p>
          </div>

          {step === 'request' ? (
            <form className="space-y-6" onSubmit={handleRequest}>
              <UIInputField
                label="Email address"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                icon={<Mail className="h-5 w-5 text-slate-400" aria-hidden="true" />}
              />
              <UIButton type="submit" variant="primary" className="w-full" disabled={loading}>
                Send reset code
              </UIButton>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleReset}>
              <UIInputField
                label="Email address"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                icon={<Mail className="h-5 w-5 text-slate-400" aria-hidden="true" />}
              />
              <UIInputField
                label="Verification code"
                type="text"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="Enter the 6-digit code"
                maxLength={6}
                required
                icon={<ShieldCheck className="h-5 w-5 text-slate-400" aria-hidden="true" />}
              />
              <div>
                <UIInputField
                  label="New password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  icon={<Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />}
                />
                {password && <PasswordStrength password={password} />}
              </div>
              <UIInputField
                label="Confirm password"
                type="password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                placeholder="Repeat your password"
                autoComplete="new-password"
                required
                icon={<ShieldCheck className="h-5 w-5 text-slate-400" aria-hidden="true" />}
              />
              <UIButton type="submit" variant="primary" className="w-full" disabled={loading}>
                Reset password
              </UIButton>
            </form>
          )}

          <p className="text-center text-sm text-[#6B7280] dark:text-slate-400 mt-6">
            Remembered your password?{' '}
            <Link to="/login" className="font-semibold text-[#5B7FFF] hover:text-[#4A6BFF] transition-colors">
              Back to login
            </Link>
          </p>
        </UICard>
      </motion.div>
    </div>
  )
}

