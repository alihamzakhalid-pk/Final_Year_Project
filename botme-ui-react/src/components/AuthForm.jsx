import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Mail, Lock, User, ShieldCheck } from 'lucide-react'
import UIButton from './ui/Button'
import UIInputField from './ui/InputField'
import PasswordStrength from './ui/PasswordStrength'

export default function AuthForm({ mode = 'login', onSubmit, disabled = false }) {
  const isSignup = useMemo(() => mode === 'signup', [mode])
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [remember, setRemember] = useState(true)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setFieldErrors({})

    const errors = {}

    if (isSignup) {
      if (!fullName.trim()) {
        errors.fullName = 'Full name is required'
      }
      if (!acceptedTerms) {
        errors.terms = 'You must accept the terms and conditions'
      }
    }

    if (!email) {
      errors.email = 'Email is required'
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!password) {
      errors.password = 'Password is required'
    } else if (isSignup && password.length < 8) {
      errors.password = 'Password must be at least 8 characters long'
    }

    if (isSignup && password !== confirm) {
      errors.confirm = 'Passwords do not match'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    try {
      await onSubmit({ fullName, email, password, remember })
      if (isSignup) {
        setSuccess('Account created successfully! Redirecting you to your dashboard…')
      }
    } catch (submitError) {
      setError(submitError?.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="space-y-5"
    >
      {isSignup && (
        <UIInputField
          label="Full name"
          value={fullName}
          onChange={(event) => {
            setFullName(event.target.value)
            if (fieldErrors.fullName) setFieldErrors({ ...fieldErrors, fullName: '' })
          }}
          placeholder="Jane Doe"
          icon={<User className="h-5 w-5 text-slate-400" aria-hidden="true" />}
          autoComplete="name"
          error={fieldErrors.fullName}
          required
        />
      )}
      <UIInputField
        label="Email address"
        type="email"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value)
          if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' })
        }}
        placeholder="you@example.com"
        autoComplete="email"
        required
        icon={<Mail className="h-5 w-5 text-slate-400" aria-hidden="true" />}
        error={fieldErrors.email}
      />
      <div>
        <UIInputField
          label="Password"
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value)
            if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' })
          }}
          placeholder="••••••••"
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          required
          icon={<Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />}
          error={fieldErrors.password}
        />
        {isSignup && password && <PasswordStrength password={password} />}
      </div>
      {isSignup && (
        <UIInputField
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={(event) => {
            setConfirm(event.target.value)
            if (fieldErrors.confirm) setFieldErrors({ ...fieldErrors, confirm: '' })
          }}
          placeholder="Repeat your password"
          autoComplete="new-password"
          required
          icon={<ShieldCheck className="h-5 w-5 text-slate-400" aria-hidden="true" />}
          error={fieldErrors.confirm}
        />
      )}

      {isSignup && (
        <div>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => {
                setAcceptedTerms(event.target.checked)
                if (fieldErrors.terms) setFieldErrors({ ...fieldErrors, terms: '' })
              }}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:outline-none focus:ring-2 focus:ring-primary/60 dark:border-slate-600"
            />
            <span className="text-slate-600 dark:text-slate-300">
              I agree to the{' '}
              <Link to="/terms" className="font-medium text-[#5B7FFF] hover:text-[#4A6AD9] dark:text-[#5B7FFF] transition-colors">
                Terms & Conditions
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="font-medium text-[#5B7FFF] hover:text-[#4A6AD9] dark:text-[#5B7FFF] transition-colors">
                Privacy Policy
              </Link>
            </span>
          </label>
          {fieldErrors.terms && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-xs text-error-600 dark:text-error-400"
            >
              {fieldErrors.terms}
            </motion.p>
          )}
        </div>
      )}

      {!isSignup && (
        <div className="flex items-center justify-between text-sm">
          <label className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:outline-none focus:ring-2 focus:ring-primary/60 dark:border-slate-600"
            />
            Remember me
          </label>
          <Link
            to="/forgot-password"
            className="font-medium text-primary-600 transition hover:text-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface dark:text-primary-400"
          >
            Forgot password?
          </Link>
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-lg bg-error-50 dark:bg-error-500/10 border border-error-200 dark:border-error-500/30 px-4 py-3 text-sm text-error-700 dark:text-error-300"
        >
          {error}
        </motion.div>
      )}
      {success && (
        <motion.p
          className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary-700 dark:bg-primary/20 dark:text-primary-200"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="inline-flex h-2 w-2 animate-pulse-subtle rounded-full bg-primary" aria-hidden="true" />
          {success}
        </motion.p>
      )}

      <UIButton
        type="submit"
        variant="primary"
        size="lg"
        className="w-full mt-2"
        disabled={disabled}
      >
        {isSignup ? 'Create account' : 'Login'}
      </UIButton>
    </motion.form>
  )
}

