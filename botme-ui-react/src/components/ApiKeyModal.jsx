import { useState, useEffect } from 'react'
import { Eye, EyeOff, Shield, Trash2 } from 'lucide-react'
import Modal from './ui/Modal'
import UIButton from './ui/Button'
import api from '../api/axios'

export default function ApiKeyModal({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [hasKey, setHasKey] = useState(false)
  const [currentProvider, setCurrentProvider] = useState(null)
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
      setCurrentProvider(res.data.provider)
    } catch (err) {
      console.error('Error checking API key:', err)
    }
  }

  // Auto-detect provider as user types
  const getDetectedProvider = (key) => {
    if (key.startsWith('sk-')) return 'OpenAI'
    if (key.startsWith('gsk_')) return 'Groq'
    return null
  }

  const handleSaveKey = async (e) => {
    e.preventDefault()

    if (!apiKey.trim()) {
      setMessageKey('API key cannot be empty')
      return
    }

    const detected = getDetectedProvider(apiKey.trim())
    if (!detected) {
      setMessageKey('Invalid format. OpenAI starts with "sk-", Groq starts with "gsk_"')
      return
    }

    setLoadingKey(true)
    try {
      const response = await api.post('/api/user/openai-key', {
        api_key: apiKey.trim()
      })
      setMessageKey(`✅ ${response.data.provider.toUpperCase()} key saved!`)
      setHasKey(true)
      setCurrentProvider(response.data.provider)
      setApiKey('')
      setTimeout(() => {
        setMessageKey('')
        onClose()
      }, 2000)
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Error saving API key'
      setMessageKey('❌ ' + errorMsg)
    } finally {
      setLoadingKey(false)
    }
  }

  const handleDeleteKey = async () => {
    if (!confirm('Remove your API key from session?')) return

    setLoadingKey(true)
    try {
      await api.delete('/api/user/openai-key')
      setMessageKey('✅ API key removed')
      setHasKey(false)
      setCurrentProvider(null)
      setTimeout(() => setMessageKey(''), 3000)
    } catch (err) {
      setMessageKey('❌ Error removing API key')
    } finally {
      setLoadingKey(false)
    }
  }

  const detected = getDetectedProvider(apiKey)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Smart API Key"
      size="sm"
    >
      <div className="space-y-4">
        <p className="text-sm text-[#6B7280]">
          Enter your <strong>OpenAI</strong> or <strong>Groq</strong> key. We'll automatically detect the provider.
        </p>

        {hasKey && (
          <div className="bg-[#5B7FFF]/10 border border-[#5B7FFF]/30 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#5B7FFF]" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 uppercase font-bold">Active Provider</span>
                <span className="text-sm font-semibold capitalize text-[#5B7FFF]">{currentProvider}</span>
              </div>
            </div>
            <span className="text-green-600 text-xs font-bold bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">Active</span>
          </div>
        )}

        <form onSubmit={handleSaveKey} className="space-y-4">
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-medium text-[#1F2937] dark:text-white">
                Enter API Key
              </label>
              {detected && (
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 ${detected === 'OpenAI' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                  {detected === 'OpenAI' ? 'OpenAI Detected' : 'Groq Detected'}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-... or gsk_..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-[#1F2937] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B7FFF] pr-10"
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
              disabled={loadingKey || !apiKey}
              className="flex-1"
            >
              {loadingKey ? 'Verifying...' : 'Save & Verify'}
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
