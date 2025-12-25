import { useEffect, useState, useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Loader2, Sparkles, Brain } from 'lucide-react'
import UICard from '../components/ui/Card'
import UIButton from '../components/ui/Button'
import Avatar from '../components/Avatar'
import Badge from '../components/ui/Badge'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import { useToast } from '../components/ui/Toast'
import api from '../api/axios'

export default function SelectPerson() {
  const { chatId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { showSuccess, showError } = useToast()
  const [participants, setParticipants] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [creatingPersona, setCreatingPersona] = useState(false)
  const [selectedPersonName, setSelectedPersonName] = useState('')

  useEffect(() => {
    const stateParticipants = location.state?.participants
    if (Array.isArray(stateParticipants)) {
      setParticipants(stateParticipants)
      return
    }

    if (!chatId) {
      setError('Missing chat identifier. Please upload your transcript again.')
      return
    }

    setLoading(true)
    api.get(`/api/chat/${chatId}/participants`)
      .then(({ data }) => {
        setParticipants(data?.participants || [])
        if ((data?.participants || []).length === 0) {
          setError('No participants found. Please upload the transcript again.')
        }
      })
      .catch((fetchError) => {
        setError(fetchError?.message || 'Unable to load participants. Please upload again.')
      })
      .finally(() => setLoading(false))
  }, [chatId, location.state])

  const handleSelect = async (participantName) => {
    try {
      setError('')
      setSelectedPersonName(participantName)
      setCreatingPersona(true)
      const response = await api.post('/api/select_person', { chat_id: chatId, person: participantName })

      // Check if selection was successful
      if (response.data?.status === 'ready' || response.data?.chat_id) {
        showSuccess(`${participantName} persona is ready!`)
        // Small delay to ensure database is updated
        await new Promise((resolve) => setTimeout(resolve, 500))
        // Navigate to chat with the persona name in state
        navigate(`/chat/${chatId}`, { replace: true, state: { person: participantName } })
      } else {
        throw new Error('Persona selection did not complete successfully')
      }
    } catch (selectionError) {
      const errorMsg = selectionError?.response?.data?.error || selectionError?.message || 'Unable to select this persona.'
      setError(errorMsg)
      showError(errorMsg)
      setCreatingPersona(false)
      setSelectedPersonName('')
    }
  }

  return (
    <section className="space-y-8 py-8 relative">
      {/* Creating Persona Overlay */}
      <AnimatePresence>
        {creatingPersona && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="mx-4 w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 p-8 shadow-2xl text-center"
            >
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#5B7FFF] to-purple-600 flex items-center justify-center">
                    <Brain className="h-10 w-10 text-white animate-pulse" />
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-2 rounded-full border-2 border-dashed border-[#5B7FFF]/50"
                  />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-[#1F2937] dark:text-slate-100 mb-2">
                Creating Your Chatbot
              </h2>
              <p className="text-[#6B7280] dark:text-slate-400 mb-4">
                Analyzing <span className="font-semibold text-[#5B7FFF]">{selectedPersonName}</span>'s messages and building their personality model...
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-[#9CA3AF] dark:text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>This may take a few seconds</span>
              </div>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                <span className="text-xs text-[#6B7280] dark:text-slate-400">
                  Training AI to respond like {selectedPersonName}
                </span>
                <Sparkles className="h-4 w-4 text-yellow-500" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="space-y-3">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-[#1F2937] dark:text-slate-100"
        >
          Choose a persona
        </motion.h1>
        <p className="text-sm text-[#6B7280] dark:text-slate-400">
          Pick the participant you would like the AI to emulate during your chat session. Each persona has been analyzed from your chat transcript.
        </p>
      </header>

      {/* Participants Grid */}
      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="card" className="h-48" />
          ))}
        </div>
      ) : participants.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {participants.map((participant, index) => (
            <motion.div
              key={participant.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <UICard className="relative overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-md hover:shadow-lg transition-shadow group">
                <div className="flex flex-col items-center text-center">
                  <Avatar name={participant.name} size={64} />
                  <h2 className="mt-4 text-xl font-bold text-[#1F2937] dark:text-slate-100">{participant.name}</h2>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge className="bg-[#E8F0FF] dark:bg-slate-700 text-[#5B7FFF] border-none">
                      <MessageSquare className="mr-1 h-3 w-3" />
                      {participant.count} messages
                    </Badge>
                  </div>
                  <p className="mt-4 text-sm text-[#6B7280] dark:text-slate-400">
                    This persona has been analyzed from {participant.count} messages in your chat transcript.
                  </p>
                  <UIButton
                    className="mt-6 w-full rounded-xl bg-[#5B7FFF] px-6 py-3 text-white font-semibold shadow-md hover:bg-[#4A6BFF] disabled:opacity-50"
                    onClick={() => handleSelect(participant.name)}
                    disabled={creatingPersona}
                  >
                    {creatingPersona && selectedPersonName === participant.name ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      'Start Chatting'
                    )}
                  </UIButton>
                </div>
              </UICard>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MessageSquare}
          title="No participants found"
          description="Please upload a chat transcript with at least 2 participants to see personas here."
          actionLabel="Go to Dashboard"
          onAction={() => navigate('/dashboard')}
        />
      )}

      {error && (
        <UICard className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-2xl">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
        </UICard>
      )}
    </section>
  )
}

