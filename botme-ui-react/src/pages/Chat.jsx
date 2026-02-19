import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Download, Settings, Upload, MessageSquare, Trash2, Brain, Volume2 } from 'lucide-react'
import ChatWindow from '../components/ChatWindow'
import MessageInput from '../components/MessageInput'
import UICard from '../components/ui/Card'
import UIButton from '../components/ui/Button'
import SearchInput from '../components/ui/SearchInput'
import Badge from '../components/ui/Badge'
import Avatar from '../components/Avatar'
import Skeleton from '../components/ui/Skeleton'
import { useToast } from '../components/ui/Toast'
import api from '../api/axios'
import VoiceSettingsModal from '../components/VoiceSettingsModal'
import ErrorBoundary from '../components/ErrorBoundary'
import Tooltip from '../components/ui/Tooltip'

export default function Chat() {
  const { chatId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  // Initialize with persona from location state if available
  const [selectedPerson, setSelectedPerson] = useState(() => {
    // Try to get from location state first
    if (location.state?.person) {
      return location.state.person
    }
    return ''
  })
  const [messages, setMessages] = useState([])
  const [typing, setTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [personas, setPersonas] = useState([])
  const [loadingPersonas, setLoadingPersonas] = useState(true)
  const [personaSearchQuery, setPersonaSearchQuery] = useState('')
  const [debugInfo, setDebugInfo] = useState(null)
  const [showDebug, setShowDebug] = useState(false)

  // Voice Settings State
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [selectedVoiceId, setSelectedVoiceId] = useState(() => {
    // Load from local storage if available for this chat
    return localStorage.getItem(`voice_for_chat_${chatId}`) || null
  })

  const { showSuccess, showError } = useToast()

  // Update selected voice and persist
  const handleVoiceSelect = (voiceId) => {
    setSelectedVoiceId(voiceId)
    if (voiceId) {
      localStorage.setItem(`voice_for_chat_${chatId}`, voiceId)
    } else {
      localStorage.removeItem(`voice_for_chat_${chatId}`)
    }
  }

  // Keyboard shortcut to toggle debug panel (Press 'D' key)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'd' || e.key === 'D') {
        if (e.ctrlKey || e.metaKey) {
          setShowDebug(prev => !prev)
        }
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Fetch all saved personas
  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        setLoadingPersonas(true)
        const response = await api.get('/api/personas')
        setPersonas(response.data?.personas || [])
      } catch (err) {
        console.error('Failed to fetch personas:', err)
        setPersonas([])
      } finally {
        setLoadingPersonas(false)
      }
    }
    fetchPersonas()
  }, [])

  useEffect(() => {
    if (!chatId) {
      setError('No chat selected. Please return to the dashboard and start again.')
      setLoading(false)
      return
    }

    // Reset voice selection when switching chats
    const savedVoiceId = localStorage.getItem(`voice_for_chat_${chatId}`)
    setSelectedVoiceId(savedVoiceId || null)

    let cancelled = false
    let retryCount = 0
    const maxRetries = 3
    const retryDelay = 1000

    const loadContext = async () => {
      if (cancelled) return

      setLoading(true)
      setError('')

      try {
        console.log(`[Chat] Loading context for chat ${chatId}`)
        setDebugInfo({ status: 'loading', message: `Fetching chat ${chatId}...`, timestamp: new Date().toISOString() })

        const response = await api.get(`/api/chat/${chatId}/context`)
        console.log(`[Chat] API Response:`, response)

        if (cancelled) return

        const data = response?.data || response
        console.log(`[Chat] Received data:`, {
          is_temp: data?.is_temp,
          ready: data?.ready,
          selected_person: data?.selected_person,
          history_length: data?.history?.length,
          full_data: data
        })

        setDebugInfo({
          status: 'success',
          message: 'Chat loaded successfully',
          data: data,
          timestamp: new Date().toISOString()
        })

        // Only redirect to select if chat is temp (not ready) AND has no selected person
        if ((data?.is_temp === true || (data?.ready === false && data?.is_temp !== false)) && !data?.selected_person) {
          console.log(`[Chat] Chat is temp, redirecting to select page`)
          navigate(`/select/${chatId}`, {
            replace: true,
            state: { participants: data?.participants || [] },
          })
          return
        }

        // Set persona name - use from API response first, then location state, then empty
        const personaName = data?.selected_person || location.state?.person || ''
        console.log(`[Chat] Setting persona: ${personaName}`)
        setSelectedPerson(personaName)

        // Load conversation history
        const history = Array.isArray(data?.history) ? data.history : []
        if (history.length) {
          setMessages(history.map((entry, index) => ({
            id: `${entry.role || 'msg'}-${index}-${chatId}`,
            role: entry.role === 'assistant' ? 'assistant' : 'user',
            content: entry.content,
            timestamp: entry.timestamp ?? Date.now(),
          })))
        } else {
          setMessages([])
        }
        setError('')
        setLoading(false)
        console.log(`[Chat] Chat loaded successfully`)
      } catch (fetchError) {
        if (cancelled) return

        console.error(`[Chat] Error loading chat:`, fetchError)
        console.error(`[Chat] Error details:`, {
          message: fetchError?.message,
          status: fetchError?.status,
          data: fetchError?.data,
          stack: fetchError?.stack
        })

        // Set debug info for error
        setDebugInfo({
          status: 'error',
          message: fetchError?.message || 'Unknown error',
          error: {
            message: fetchError?.message,
            status: fetchError?.status,
            data: fetchError?.data,
            stack: fetchError?.stack?.substring(0, 500)
          },
          timestamp: new Date().toISOString()
        })

        // Get status from error object (custom axios uses error.status)
        const status = fetchError?.status

        if (status === 404 && retryCount < maxRetries) {
          retryCount++
          console.log(`[Chat] Chat ${chatId} not found, retrying... (${retryCount}/${maxRetries})`)
          await new Promise((resolve) => setTimeout(resolve, retryDelay))
          return loadContext()
        }

        if (status === 404) {
          console.log(`[Chat] Chat ${chatId} not found after retries`)
          setError('Chat session not found. It may have expired or been deleted. Please return to the dashboard and upload a new chat.')
          // Still try to show chat if we have persona from location state
          if (location.state?.person) {
            console.log(`[Chat] Using persona from location state: ${location.state.person}`)
            setSelectedPerson(location.state.person)
            setMessages([])
          }
          setLoading(false)
        } else if (status === 401 || status === 403) {
          console.log(`[Chat] Unauthorized access`)
          setError('You are not authorized to access this chat. Please log in again.')
          setLoading(false)
          setTimeout(() => {
            if (!cancelled) {
              navigate('/login', { replace: true })
            }
          }, 2000)
        } else if (status === 0 || !status) {
          // Network/connection errors (status 0 means no response)
          const errorMsg = fetchError?.message || 'Cannot connect to server. Please check your connection and try again.'
          console.log(`[Chat] Network error, showing helpful message:`, errorMsg)
          setError(errorMsg)
          // Still try to show chat if we have persona from location state
          const fallbackPersona = location.state?.person || ''
          console.log(`[Chat] Using fallback persona: ${fallbackPersona || 'none'}`)
          setSelectedPerson(fallbackPersona)
          setMessages([])
          setLoading(false)
        } else {
          // For other errors, still show the chat interface but with error message
          const errorMsg = fetchError?.data?.error || fetchError?.message || 'Unable to load chat history. You can still send messages.'
          console.log(`[Chat] Non-critical error, showing chat anyway:`, errorMsg)
          setError(errorMsg)
          // Still allow chat to work even with errors - use persona from location state or empty
          const fallbackPersona = location.state?.person || ''
          console.log(`[Chat] Using fallback persona: ${fallbackPersona || 'none'}`)
          setSelectedPerson(fallbackPersona)
          setMessages([])
          setLoading(false)
        }
      }
    }

    loadContext()

    return () => {
      cancelled = true
    }
  }, [chatId]) // Only depend on chatId to reload when it changes

  useEffect(() => {
    if (!loading && !messages.length && selectedPerson) {
      setMessages([
        {
          id: `welcome-${chatId}`,
          role: 'assistant',
          content: `Salam! Main ${selectedPerson} hoon. Chat shuru karein aur jo chahein puchhein.`,
          timestamp: Date.now(),
        },
      ])
    }
  }, [loading, messages.length, selectedPerson, chatId])

  const handleSend = async (content) => {
    const trimmed = content.trim()
    if (!trimmed) return

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setTyping(true)
    setStatus('Generating reply…')
    setError('')

    try {
      const { data } = await api.post(`/api/chat/${chatId}/rag`, { message: trimmed })
      const assistantReply = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data?.response || `I'm having trouble responding right now, lekin main ${selectedPerson || 'bot'} jaldi reply karega.`,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, assistantReply])

      // Refresh personas list to update last chat date
      const response = await api.get('/api/personas')
      setPersonas(response.data?.personas || [])
    } catch (sendError) {
      const errorMsg = sendError?.message || sendError?.data?.error || 'Message could not be delivered. Please try again.'
      setError(errorMsg)
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id))
    } finally {
      setTyping(false)
      setStatus('')
    }
  }

  const handleSwitchPersona = async (personaChatId) => {
    if (personaChatId.toString() === chatId) return
    // Reset state before switching
    setLoading(true)
    setMessages([])
    setSelectedPerson('')
    setError('')
    setSearchQuery('')
    // Navigate to new chat - use replace: false to allow back navigation
    navigate(`/chat/${personaChatId}`, { replace: false, state: {} })
    // Refresh personas list after a short delay
    setTimeout(async () => {
      try {
        const response = await api.get('/api/personas')
        setPersonas(response.data?.personas || [])
      } catch (err) {
        console.error('Failed to refresh personas:', err)
      }
    }, 500)
  }

  const filteredMessages = useMemo(() => {
    if (!searchQuery) return messages
    const query = searchQuery.toLowerCase()
    return messages.filter((msg) => msg.content.toLowerCase().includes(query))
  }, [messages, searchQuery])

  const filteredPersonas = useMemo(() => {
    if (!personaSearchQuery) return personas
    const query = personaSearchQuery.toLowerCase()
    return personas.filter(p => p.name?.toLowerCase().includes(query))
  }, [personas, personaSearchQuery])

  const handleExport = () => {
    const content = messages.map((m) => `${m.role === 'user' ? 'You' : selectedPerson}: ${m.content}`).join('\n\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-${chatId}-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
    showSuccess('Conversation exported successfully!')
  }

  const handleDeletePersona = async (personaChatId, e) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this persona? This action cannot be undone.')) {
      return
    }
    try {
      await api.delete(`/api/chat/${personaChatId}`)
      showSuccess('Persona deleted successfully')
      // Refresh personas list
      const response = await api.get('/api/personas')
      setPersonas(response.data?.personas || [])
      // If deleted persona was the current chat, navigate to dashboard
      if (personaChatId.toString() === chatId) {
        navigate('/dashboard')
      }
    } catch (error) {
      showError(error?.data?.error || 'Failed to delete persona')
    }
  }

  const formatLastMessageTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  // Show full loading screen only if we have no chatId or critical 404 error
  if (!chatId) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="space-y-4 text-center max-w-md">
          <div className="rounded-xl bg-red-50 border border-red-200 px-6 py-4">
            <p className="text-sm font-medium text-red-700 mb-4">No chat selected. Please return to the dashboard.</p>
            <UIButton
              onClick={() => navigate('/dashboard')}
              className="bg-[#5B7FFF] text-white hover:bg-[#4A6BFF]"
            >
              Go to Dashboard
            </UIButton>
          </div>
        </div>
      </div>
    )
  }

  // Show error screen only for critical 404 errors when we have no persona at all and no chatId
  // Otherwise, always show the chat interface
  if (error && !selectedPerson && !loading && error.includes('not found') && !location.state?.person && !chatId) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="space-y-4 text-center max-w-md">
          <div className="rounded-xl bg-red-50 border border-red-200 px-6 py-4">
            <p className="text-sm font-medium text-red-700 mb-4">{error}</p>
            <UIButton
              onClick={() => navigate('/dashboard')}
              className="bg-[#5B7FFF] text-white hover:bg-[#4A6BFF]"
            >
              Go to Dashboard
            </UIButton>
          </div>
        </div>
      </div>
    )
  }

  // Always show chat interface if we have chatId, even if loading or has errors
  // The interface will show loading/error states inline

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-0">
      {/* Debug Panel - Toggle with D key */}
      {showDebug && debugInfo && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md rounded-xl bg-slate-900 text-white p-4 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm">Debug Info</h3>
            <button
              onClick={() => setShowDebug(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div><strong>Status:</strong> {debugInfo.status}</div>
            <div><strong>Message:</strong> {debugInfo.message}</div>
            <div><strong>Time:</strong> {new Date(debugInfo.timestamp).toLocaleTimeString()}</div>
            {debugInfo.error && (
              <div className="mt-2 p-2 bg-red-900/50 rounded">
                <div><strong>Error Status:</strong> {debugInfo.error.status || 'N/A'}</div>
                <div><strong>Error Message:</strong> {debugInfo.error.message}</div>
                {debugInfo.error.data && (
                  <div className="mt-1 text-xs break-all">
                    <strong>Error Data:</strong> {JSON.stringify(debugInfo.error.data, null, 2)}
                  </div>
                )}
              </div>
            )}
            {debugInfo.data && (
              <div className="mt-2 p-2 bg-green-900/50 rounded text-xs break-all max-h-40 overflow-auto">
                <strong>Response Data:</strong>
                <pre className="mt-1">{JSON.stringify(debugInfo.data, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Left Sidebar - 300px fixed */}
      <div className="w-[300px] flex-shrink-0 flex flex-col bg-white border-r border-[#E5E7EB]">
        {/* Header */}
        <div className="px-5 py-5 border-b border-[#E5E7EB]">
          <h3 className="text-base font-bold text-[#111827]" style={{ color: '#111827', fontWeight: 700 }}>All Personas</h3>
        </div>

        {/* Search Bar */}
        <div className="px-5 py-4 border-b border-[#E5E7EB]">
          <SearchInput
            value={personaSearchQuery}
            onChange={(e) => setPersonaSearchQuery(e.target.value)}
            placeholder="Search personas..."
            className="w-full h-10 bg-[#F3F4F6]"
          />
        </div>

        {/* Personas List - Scrollable */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="space-y-0">
            {loadingPersonas ? (
              <div className="text-center py-8 text-[#6B7280] text-sm">Loading personas...</div>
            ) : filteredPersonas.length > 0 ? (
              filteredPersonas.map((persona) => {
                const isActive = persona.chat_id.toString() === chatId
                return (
                  <motion.div
                    key={persona.chat_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => handleSwitchPersona(persona.chat_id)}
                    className={`group relative flex items-center gap-3 px-5 py-4 cursor-pointer transition-all ${isActive
                      ? 'bg-[#EFF6FF] border-l-4 border-[#5B7FFF]'
                      : 'hover:bg-[#F9FAFB]'
                      }`}
                    style={{ height: '72px' }}
                  >
                    <Avatar name={persona.name} size={40} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#111827] truncate" style={{ color: '#111827', fontWeight: 700 }}>{persona.name}</p>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        {persona.message_count || 0} messages • {formatLastMessageTime(persona.last_chat_date)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeletePersona(persona.chat_id, e)
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-[#6B7280] hover:bg-red-50 hover:text-red-600 transition-all"
                      aria-label="Delete persona"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                )
              })
            ) : (
              <div className="text-center py-8 text-[#6B7280] text-sm">
                {personaSearchQuery ? 'No personas found' : 'No personas yet'}
              </div>
            )}
          </div>
        </div>

        {/* New Upload Button - Sticky at bottom */}
        <div className="sticky bottom-0 border-t border-[#E5E7EB] bg-white p-3">
          <UIButton
            variant="outline"
            className="w-full justify-center gap-2 rounded-xl border-2 border-[#E5E7EB] bg-white h-12 px-4 text-sm font-semibold text-[#1F2937] hover:bg-[#EFF6FF] hover:border-[#5B7FFF] hover:text-[#5B7FFF] transition-all duration-200 shadow-sm hover:shadow-md"
            onClick={() => navigate('/dashboard')}
          >
            <Upload className="h-5 w-5" />
            + New Upload
          </UIButton>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Header Bar - 64px height */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#E5E7EB] bg-white">
          <div className="flex items-center gap-3">
            <Avatar name={selectedPerson || 'AI'} size={36} />
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#111827]" style={{ color: '#111827', fontWeight: 700 }}>{selectedPerson || 'AI'}</h2>
              {selectedPerson && (
                <Badge className="bg-[#EFF6FF] text-[#5B7FFF] border-none rounded-full px-2.5 py-0.5 text-xs font-medium">
                  Persona: {selectedPerson}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">

            {/* Voice Settings Button */}
            <Tooltip content={selectedVoiceId ? 'Voice Active' : 'Select Voice'}>
              <button
                onClick={() => setShowVoiceModal(true)}
                className={`rounded-lg p-2 transition-colors ${selectedVoiceId ? 'text-primary bg-primary/10' : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#5B7FFF]'}`}
                aria-label="Voice Settings"
              >
                <Volume2 className="h-5 w-5" />
              </button>
            </Tooltip>

            {selectedPerson && (
              <UIButton
                onClick={() => navigate(`/personality/${chatId}`, { state: { personName: selectedPerson, chatId } })}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <Brain className="h-4 w-4" />
                Personality Analysis
              </UIButton>
            )}
            <button
              onClick={handleExport}
              className="rounded-lg p-2 text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#5B7FFF] transition-colors"
              aria-label="Export conversation"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              className="rounded-lg p-2 text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#5B7FFF] transition-colors"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Error Message - Always visible */}
        {error && (
          <div className="rounded-xl bg-red-50 border-2 border-red-300 px-4 py-3 text-sm text-red-700">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <strong className="font-semibold">⚠️ Error:</strong> {error}
                </div>
              </div>
              {error.includes('server') || error.includes('connection') || error.includes('Network') ? (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                  <strong>💡 Troubleshooting:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-yellow-800">
                    <li>Check your internet connection</li>
                    <li>The server may be temporarily unavailable - try again in a moment</li>
                    <li>Open browser console (F12) and check Network tab for failed requests</li>
                    <li>Verify CORS settings in Flask app allow requests from your frontend</li>
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Status Message */}
        {status && (
          <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
            {status}
          </div>
        )}


        {/* Messages Area - Scrollable */}
        <div className="flex-1 overflow-hidden">
          {loading && !selectedPerson ? (
            <div className="flex h-full items-center justify-center bg-[#F8FAFC]">
              <div className="text-center space-y-3">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#5B7FFF] border-r-transparent"></div>
                <p className="text-sm text-[#6B7280]">Loading chat...</p>
              </div>
            </div>
          ) : (
            <ErrorBoundary>
              <ChatWindow
                messages={searchQuery ? filteredMessages : messages}
                typing={typing}
                personaName={selectedPerson || 'AI'}
                selectedVoiceId={selectedVoiceId}
              />
            </ErrorBoundary>
          )}
        </div>

        {/* Message Input - Fixed at bottom */}
        <div className="flex-shrink-0">
          <MessageInput
            onSend={handleSend}
            disabled={typing || !selectedPerson || (loading && !selectedPerson)}
          />
        </div>
      </div>

      {/* Voice Settings Modal */}
      <VoiceSettingsModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        selectedVoiceId={selectedVoiceId}
        onVoiceSelect={handleVoiceSelect}
      />
    </div>
  )
}
