import { useEffect, useState, useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageSquare } from 'lucide-react'
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
      setLoading(true)
      const response = await api.post('/api/select_person', { chat_id: chatId, person: participantName })
      
      // Check if selection was successful
      if (response.data?.status === 'ready' || response.data?.chat_id) {
        showSuccess(`Selected ${participantName} as persona!`)
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
      setLoading(false)
    }
  }

  return (
    <section className="space-y-8 py-8">
      <header className="space-y-3">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-[#1F2937]"
        >
          Choose a persona
        </motion.h1>
        <p className="text-sm text-[#6B7280]">
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
              <UICard className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-md hover:shadow-lg transition-shadow group">
                <div className="flex flex-col items-center text-center">
                  <Avatar name={participant.name} size={64} />
                  <h2 className="mt-4 text-xl font-bold text-[#1F2937]">{participant.name}</h2>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge className="bg-[#E8F0FF] text-[#5B7FFF] border-none">
                      <MessageSquare className="mr-1 h-3 w-3" />
                      {participant.count} messages
                    </Badge>
                  </div>
                  <p className="mt-4 text-sm text-[#6B7280]">
                    This persona has been analyzed from {participant.count} messages in your chat transcript.
                  </p>
                  <UIButton
                    className="mt-6 w-full rounded-xl bg-[#5B7FFF] px-6 py-3 text-white font-semibold shadow-md hover:bg-[#4A6BFF]"
                    onClick={() => handleSelect(participant.name)}
                    disabled={loading}
                  >
                    Start Chatting
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
        <UICard className="border-red-200 bg-red-50 rounded-2xl">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </UICard>
      )}
    </section>
  )
}
