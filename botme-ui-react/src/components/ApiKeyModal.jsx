import { useState, useEffect } from 'react'
import { Eye, EyeOff, Shield, Trash2 } from 'lucide-react'
import Modal from './ui/Modal'
import UIButton from './ui/Button'
import api from '../api/axios'

export default function ApiKeyModal({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [hasKey, setHasKey] = useState(false)
  const [loadingKey, setLoadingKey] = useState(false)
  const [messageKey, setMessageKey] = useState('')

  // Check if user has API key on mount
  useEffect(() => {
    if (isOpen) {
      checkApiKey()
    }
  }, [isOpen])

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
      const response = await api.post('/api/user/openai-key', {
        api_key: apiKey.trim()
      })
      console.log('[API_KEY_SAVE] Success:', response.data)
      setMessageKey('✅ API key saved securely!')
      setHasKey(true)
      setApiKey('')
      setTimeout(() => {
        setMessageKey('')
        onClose()
      }, 2000)
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Error saving API key'
      console.error('[API_KEY_SAVE] Error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: errorMsg
      })
      setMessageKey('❌ ' + errorMsg)
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="OpenAI API Key"
      size="sm"
    >
      <div className="space-y-4">
        <p className="text-sm text-[#6B7280]">
          Your API key is stored securely in your session and automatically expires after 1 hour of inactivity.
          <strong> Your key is never saved to the database.</strong>
        </p>

        {hasKey && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3 flex items-center gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span className="text-sm text-green-700 dark:text-green-300">
              API key is configured and ready to use
            </span>
          </div>
        )}

        <form onSubmit={handleSaveKey} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1F2937] dark:text-white mb-2">
              OpenAI API Key (sk-...)
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-[#1F2937] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B7FFF]"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {messageKey && (
            <div className={`text-sm ${messageKey.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
              {messageKey}
            </div>
          )}

          <div className="flex gap-2">
            <UIButton
              type="submit"
              variant="primary"
              size="sm"
              disabled={loadingKey}
              className="flex-1"
            >
              {loadingKey ? 'Saving...' : 'Save API Key'}
            </UIButton>
            {hasKey && (
              <UIButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleDeleteKey}
                disabled={loadingKey}
              >
                <Trash2 className="h-4 w-4" />
              </UIButton>
            )}
          </div>
        </form>
      </div>
    </Modal>
  )
}
