import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CloudUpload, Trash2, Search, MessageSquare, Brain, Sparkles } from 'lucide-react'
import UICard from '../components/ui/Card'
import Avatar from '../components/Avatar'
import UIButton from '../components/ui/Button'
import SearchInput from '../components/ui/SearchInput'
import { useAuth } from '../hooks/useAuth'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../components/ui/Toast'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [personas, setPersonas] = useState([])
  const [loadingPersonas, setLoadingPersonas] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  // Fetch saved personas
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

  const handleFileSelected = async (selectedFile) => {
    if (!selectedFile) return

    // Validate file
    if (!selectedFile.name.endsWith('.txt')) {
      setError('Invalid file format. Please upload a .txt file.')
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit.')
      return
    }

    setFile(selectedFile)
    setError('')
    setStatus('Ready to analyse. Click "Analyse transcript" to continue.')
  }

  const handleAnalyse = async () => {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      setStatus('Uploading transcript…')
      const formData = new FormData()
      formData.append('file', file)

      const { data: uploadData } = await api.post('/api/upload', formData)
      const chatId = uploadData?.chat_id
      const participants = uploadData?.participants || []

      if (!chatId || participants.length === 0) {
        throw new Error('No participants found in the chat.')
      }

      setStatus('Analysis complete! Redirecting…')
      showSuccess(`Chat analyzed! ${participants.length} personas found`)

      setTimeout(() => {
        navigate(`/select/${chatId}`, {
          state: { participants },
        })
      }, 500)
    } catch (uploadError) {
      const errorMsg = uploadError?.response?.data?.error || uploadError?.message || 'Unable to analyse the file. Please try again.'
      setError(errorMsg)
      showError(errorMsg)
      setStatus('')
    } finally {
      setBusy(false)
    }
  }

  const handleChatWithPersona = (chatId) => {
    navigate(`/chat/${chatId}`)
  }

  const handleDeletePersona = async (chatId, e) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this persona? This will remove all conversation history permanently.')) {
      return
    }
    try {
      await api.delete(`/api/chat/${chatId}`)
      setPersonas(personas.filter(p => p.chat_id !== chatId))
      showSuccess('Persona deleted successfully')
    } catch (err) {
      showError('Failed to delete persona')
    }
  }

  const formatTimeAgo = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const filteredPersonas = personas.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Avatar colors rotation
  const avatarColors = ['#5B7FFF', '#A855F7', '#10B981', '#F59E0B', '#EC4899']
  const getAvatarColor = (index) => avatarColors[index % avatarColors.length]

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <UICard className="rounded-xl bg-white dark:bg-slate-800 p-8 shadow-sm border border-[#E5E7EB] dark:border-slate-700">
            <label
              htmlFor="chat-upload"
              onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)
                const droppedFile = e.dataTransfer.files?.[0]
                if (droppedFile) handleFileSelected(droppedFile)
              }}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed transition-all ${isDragging
                ? 'border-[#5B7FFF] bg-[#EFF6FF]'
                : 'border-[#E5E7EB] bg-white hover:border-[#5B7FFF] hover:bg-[#EFF6FF]'
                } px-8 py-16`}
            >
              <CloudUpload className={`h-16 w-16 ${isDragging ? 'text-[#5B7FFF]' : 'text-[#6B7280]'}`} />
              <div className="text-center space-y-2">
                <p className="text-base font-medium text-[#1F2937] dark:text-slate-100">
                  Drag and drop your chat file
                </p>
                <p className="text-sm text-[#6B7280] dark:text-slate-400">
                  Accepted format: WhatsApp or Messenger export (.txt). Max size: 5MB
                </p>
              </div>
              <input
                id="chat-upload"
                type="file"
                accept=".txt"
                onChange={(e) => handleFileSelected(e.target.files?.[0])}
                className="hidden"
              />
            </label>

            {/* Analyse Button */}
            <div className="mt-6 flex justify-center">
              <UIButton
                onClick={handleAnalyse}
                disabled={!file || busy}
                className="rounded-lg bg-[#5B7FFF] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#4A6AD9] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? 'Processing…' : 'Analyse transcript'}
              </UIButton>
            </div>

            {/* Status/Error Messages */}
            {status && (
              <div className="mt-4 rounded-lg bg-[#EFF6FF] px-4 py-3 text-sm text-[#1F2937] text-center">
                {status}
              </div>
            )}
            {error && (
              <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 text-center">
                {error}
              </div>
            )}
          </UICard>
        </motion.div>

        {/* Personas Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1F2937] dark:text-slate-100">
              Your Personas {personas.length > 0 && `(${personas.length})`}
            </h2>
            {personas.length > 0 && (
              <div className="w-64">
                <SearchInput
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search personas..."
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Personas List */}
          {loadingPersonas ? (
            <div className="text-center py-12 text-[#6B7280]">Loading personas...</div>
          ) : filteredPersonas.length > 0 ? (
            <div className="space-y-4">
              {filteredPersonas.map((persona, index) => (
                <motion.div
                  key={persona.chat_id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative flex items-center gap-4 rounded-xl bg-white dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 p-4 transition-all duration-200 hover:shadow-md hover:border-[#5B7FFF] cursor-pointer"
                  onClick={() => handleChatWithPersona(persona.chat_id)}
                >
                  {/* Avatar */}
                  <div
                    className="flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                    style={{ backgroundColor: getAvatarColor(index) }}
                  >
                    {persona.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>

                  {/* Middle Section */}
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-[#111827] truncate" style={{ color: '#111827', fontWeight: 700 }}>
                      {persona.name || 'Unknown'}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-[#6B7280]">
                      <span>{persona.message_count || 0} messages</span>
                      {persona.last_chat_date && (
                        <>
                          <span>•</span>
                          <span>Created {new Date(persona.last_chat_date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(persona.last_chat_date)}</span>
                        </>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-[#6B7280] truncate">
                      💬 {persona.last_message || 'No messages yet...'}
                    </p>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2">
                    <UIButton
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/personality/${persona.chat_id}`, { state: { personName: persona.name, chatId: persona.chat_id } })
                      }}
                      className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <Brain className="h-4 w-4" />
                      Analyze
                    </UIButton>
                    <UIButton
                      onClick={(e) => {
                        e.stopPropagation()
                        handleChatWithPersona(persona.chat_id)
                      }}
                      className="flex items-center gap-2 rounded-lg bg-[#5B7FFF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4A6AD9] transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Chat
                    </UIButton>
                    <button
                      onClick={(e) => handleDeletePersona(persona.chat_id, e)}
                      className="rounded-lg p-2 text-[#6B7280] hover:bg-red-50 hover:text-[#EF4444] transition-all duration-200 opacity-0 group-hover:opacity-100"
                      aria-label="Delete persona"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <UICard className="rounded-xl bg-white border border-[#E5E7EB] p-12 text-center">
              <MessageSquare className="h-12 w-12 text-[#9CA3AF] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#1F2937] mb-2">No personas yet</h3>
              <p className="text-sm text-[#6B7280] mb-6">
                Upload a chat transcript to extract personas and start conversations
              </p>
              <UIButton
                onClick={() => document.getElementById('chat-upload')?.click()}
                className="rounded-lg bg-[#5B7FFF] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4A6AD9]"
              >
                Upload Your First Chat
              </UIButton>
            </UICard>
          )}
        </motion.div>
      </div>
    </div>
  )
}
