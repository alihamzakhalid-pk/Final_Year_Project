import { useState } from 'react'
import axios from 'axios'

/**
 * Custom hook for Firebase OTP authentication
 * Handles verification code sending and verification
 * Works with both signup and password reset flows
 */
export const useFirebaseOTP = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  /**
   * Request OTP to be sent to email
   * @param {string} email - User's email address
   * @param {string} purpose - 'signup' or 'reset'
   * @returns {Promise<{success: boolean, message: string}>}
   */
  const sendOTP = async (email, purpose = 'signup') => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      console.log(`[FIREBASE-OTP] Requesting ${purpose} OTP for ${email}`)

      const response = await axios.post('/api/request-otp', {
        email: email.toLowerCase().trim(),
        purpose: purpose,
      })

      if (response.status === 200) {
        setSuccess(true)
        console.log('[FIREBASE-OTP] ✅ OTP sent successfully')
        return {
          success: true,
          message: response.data.message || 'OTP sent to your email',
          email: email,
        }
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.message || 'Failed to send OTP'
      setError(errorMessage)
      console.error('[FIREBASE-OTP] ❌ Error:', errorMessage)
      return {
        success: false,
        message: errorMessage,
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Verify OTP code
   * @param {string} email - User's email address
   * @param {string} code - 6-digit OTP code
   * @param {string} purpose - 'signup' or 'reset'
   * @returns {Promise<{success: boolean, message: string, user?: object}>}
   */
  const verifyOTP = async (email, code, purpose = 'signup') => {
    setLoading(true)
    setError(null)

    try {
      console.log(`[FIREBASE-OTP] Verifying ${purpose} OTP for ${email}`)

      const endpoint =
        purpose === 'signup' ? '/api/verify-signup' : '/api/verify-reset'

      const response = await axios.post(endpoint, {
        email: email.toLowerCase().trim(),
        code: code.trim(),
      })

      if (response.status === 200) {
        setSuccess(true)
        console.log('[FIREBASE-OTP] ✅ OTP verified successfully')
        return {
          success: true,
          message: response.data.message || 'OTP verified',
          user: response.data.user || response.data,
        }
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.message || 'Failed to verify OTP'
      setError(errorMessage)
      console.error('[FIREBASE-OTP] ❌ Error:', errorMessage)
      return {
        success: false,
        message: errorMessage,
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Resend OTP code
   * @param {string} email - User's email address
   * @param {string} purpose - 'signup' or 'reset'
   * @returns {Promise<{success: boolean, message: string}>}
   */
  const resendOTP = async (email, purpose = 'signup') => {
    return sendOTP(email, purpose)
  }

  return {
    sendOTP,
    verifyOTP,
    resendOTP,
    loading,
    error,
    success,
  }
}
