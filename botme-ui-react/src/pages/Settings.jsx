import { useState } from 'react'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Trash2, AlertTriangle, User, Mail, Calendar, Shield, LogOut, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import UICard from '../components/ui/Card'
import UIButton from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import api from '../api/axios'

export default function Settings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  
  // OpenAI API Key state
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [hasKey, setHasKey] = useState(false)
  const [loadingKey, setLoadingKey] = useState(false)
  const [messageKey, setMessageKey] = useState('')

  // Check if user has API key on mount
  useEffect(() => {
    checkApiKey()
  }, [])

  const checkApiKey = async () => {
    try {
      const res = await api.get('/api/user/openai-key')
      setHasKey(res.data.has_key)
    } catch (err) {
      console.error('Error checking API key:', err)
    }
  }

  const handleSaveKey = async (e) => {
    e.preventDefault()
    
    if (!apiKey.trim()) {
      setMessageKey('API key cannot be empty')
      return
    }

    if (!apiKey.startsWith('sk-')) {
      setMessageKey('Invalid OpenAI API key format. Must start with "sk-"')
      return
    }

    setLoadingKey(true)
    try {
      await api.post('/api/user/openai-key', {
        api_key: apiKey.trim()
      })
      setMessageKey('✅ API key saved securely!')
      setHasKey(true)
      setApiKey('')
      setTimeout(() => setMessageKey(''), 3000)
    } catch (err) {
      setMessageKey('❌ ' + (err.response?.data?.error || 'Error saving API key'))
    } finally {
      setLoadingKey(false)
    }
  }

  const handleDeleteKey = async () => {
    if (!confirm('Remove your OpenAI API key from session?')) return

    setLoadingKey(true)
    try {
      await api.delete('/api/user/openai-key')
      setMessageKey('✅ API key removed')
      setHasKey(false)
      setTimeout(() => setMessageKey(''), 3000)
    } catch (err) {
      setMessageKey('❌ Error removing API key')
    } finally {
      setLoadingKey(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== 'delete') {
      setError('Please type "delete" to confirm')
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      await api.delete('/api/account/delete')
      
      // Clear local storage
      localStorage.removeItem('auth_token')
      
      // Logout
      if (logout) {
        await logout()
      }
      
      // Navigate to home
      navigate('/')
      
      // Show success message (optional)
      alert('Your account has been deleted successfully.')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete account. Please try again.')
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1F2937] mb-2">Settings</h1>
          <p className="text-[#6B7280] mb-8">Manage your account settings and preferences</p>

          {/* Account Information */}
          <UICard className="mb-6 p-6">
            <h2 className="text-xl font-bold text-[#1F2937] mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-[#6C63FF]" />
              Account Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#6B7280]" />
                <div>
                  <p className="text-sm text-[#6B7280]">Email</p>
                  <p className="text-base font-semibold text-black">{user?.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-[#6B7280]" />
                <div>
                  <p className="text-sm text-[#6B7280]">Username</p>
                  <p className="text-base font-semibold text-black">{user?.username || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-[#6B7280]" />
                <div>
                  <p className="text-sm text-[#6B7280]">Member Since</p>
                  <p className="text-base font-semibold text-black">
                    {formatDate(user?.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </UICard>

          {/* OpenAI API Key Section */}
          <UICard className="mb-6 p-6">
            <h2 className="text-xl font-bold text-[#1F2937] mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#6C63FF]" />
              OpenAI API Key
            </h2>
            
            <p className="text-sm text-[#6B7280] mb-4">
              Your API key is stored securely in your session and automatically expires after 1 hour of inactivity.
              <strong> Your key is never saved to the database.</strong>
            </p>

            {hasKey && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3 mb-4 flex items-center gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span className="text-sm text-green-700 dark:text-green-300">
                  API key is configured and ready to use
                </span>
              </div>
            )}

            <form onSubmit={handleSaveKey} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-2">
                  OpenAI API Key (sk-...)
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg bg-white text-[#1F2937] placeholder-[#9CA3AF] focus:ring-2 focus:ring-[#5B7FFF] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-2.5 text-[#6B7280] hover:text-[#1F2937]"
                  >
                    {showKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-[#6B7280] mt-1">
                  Get your key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-[#5B7FFF] hover:underline">openai.com/api-keys</a>
                </p>
              </div>

              {messageKey && (
                <p className={`text-sm ${messageKey.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                  {messageKey}
                </p>
              )}

              <div className="flex gap-2">
                <UIButton
                  type="submit"
                  disabled={loadingKey}
                  className="flex-1"
                >
                  {loadingKey ? 'Saving...' : 'Save API Key'}
                </UIButton>
                {hasKey && (
                  <UIButton
                    type="button"
                    onClick={handleDeleteKey}
                    disabled={loadingKey}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Remove
                  </UIButton>
                )}
              </div>
            </form>

            {/* Session Info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700">
                <strong>⏱️ Session Expiry:</strong> Your API key session expires after 1 hour of inactivity. You'll need to re-enter your API key after logout.
              </p>
            </div>
          </UICard>

          {/* Privacy & Security */}
          <UICard className="mb-6 p-6">
            <h2 className="text-xl font-bold text-[#1F2937] mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#6C63FF]" />
              Privacy & Security
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-[#6B7280]">
                Your data is encrypted and stored securely. You can delete your account at any time.
              </p>
              <UIButton
                variant="outline"
                onClick={() => navigate('/privacy')}
                className="w-full sm:w-auto"
              >
                View Privacy Policy
              </UIButton>
            </div>
          </UICard>

          {/* Danger Zone */}
          <UICard className="border-2 border-red-200 bg-red-50/50 p-6">
            <h2 className="text-xl font-bold text-red-700 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </h2>
            <p className="text-sm text-red-600 mb-6">
              Once you delete your account, there is no going back. All your data, including chats and personas, will be permanently deleted.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <UIButton
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </UIButton>
              
              <UIButton
                variant="outline"
                onClick={async () => {
                  if (logout) {
                    await logout()
                  }
                  navigate('/login')
                }}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </UIButton>
            </div>
          </UICard>
        </motion.div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeleteConfirmText('')
          setError('')
        }}
        title="Delete Account"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 mb-1">This action cannot be undone</p>
              <p className="text-sm text-red-700">
                This will permanently delete your account and remove all of your data from our servers. 
                This includes all your chats, personas, and conversation history.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1F2937] mb-2">
              Type <span className="font-mono bg-red-100 px-2 py-1 rounded">delete</span> to confirm:
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => {
                setDeleteConfirmText(e.target.value)
                setError('')
              }}
              placeholder="Type 'delete' to confirm"
              className="w-full px-4 py-2 border-2 border-[#E5E7EB] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <UIButton
              onClick={handleDeleteAccount}
              disabled={isDeleting || deleteConfirmText.toLowerCase() !== 'delete'}
              className="flex-1 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Delete My Account'}
            </UIButton>
            <UIButton
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false)
                setDeleteConfirmText('')
                setError('')
              }}
              disabled={isDeleting}
              className="flex-1"
            >
              Cancel
            </UIButton>
          </div>
        </div>
      </Modal>
    </div>
  )
}

