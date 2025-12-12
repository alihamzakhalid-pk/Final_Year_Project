import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import {
  MessageSquare,
  Smile,
  Clock,
  Activity,
  TrendingUp,
  Calendar,
  BarChart3,
  Brain,
} from 'lucide-react'
import UICard from '../components/ui/Card'
import UIButton from '../components/ui/Button'
import OverviewCard from '../components/personality/OverviewCard'
import CommunicationChart from '../components/personality/CommunicationChart'
import EmotionalTone from '../components/personality/EmotionalTone'
import ActivityPatterns from '../components/personality/ActivityPatterns'
import PersonalityTraits from '../components/personality/PersonalityTraits'
import usePersonalityAnalysis from '../hooks/usePersonalityAnalysis'
import api from '../api/axios'

export default function PersonalityAnalysis() {
  const { chatId: chatIdParam } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [personName, setPersonName] = useState(location.state?.personName || '')
  
  // Get chatId from URL param or location state
  const chatId = chatIdParam || location.state?.chatId
  
  // Debug logging
  useEffect(() => {
    console.log('[PersonalityAnalysis] chatId from params:', chatIdParam)
    console.log('[PersonalityAnalysis] chatId from state:', location.state?.chatId)
    console.log('[PersonalityAnalysis] Final chatId:', chatId)
    console.log('[PersonalityAnalysis] personName:', personName)
  }, [chatIdParam, location.state, chatId, personName])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'communication', label: 'Communication', icon: MessageSquare },
    { id: 'emotion', label: 'Emotional Tone', icon: Smile },
    { id: 'activity', label: 'Activity Patterns', icon: Activity },
    { id: 'traits', label: 'Personality Traits', icon: Brain },
  ]

  // Fetch person name from API if chatId is provided
  useEffect(() => {
    if (chatId && !personName) {
      const fetchPersonData = async () => {
        try {
          const numericChatId = parseInt(chatId, 10)
          if (isNaN(numericChatId)) {
            console.error('[PersonalityAnalysis] Invalid chatId:', chatId)
            return
          }
          console.log('[PersonalityAnalysis] Fetching context for chat:', numericChatId)
          const response = await api.get(`/api/chat/${numericChatId}/context`)
          const data = response?.data || response
          console.log('[PersonalityAnalysis] Context data:', data)
          if (data?.selected_person) {
            setPersonName(data.selected_person)
          }
        } catch (error) {
          console.error('[PersonalityAnalysis] Failed to fetch person data:', error)
        }
      }
      fetchPersonData()
    }
  }, [chatId, personName])

  // Get personality analysis data
  const { analysis, loading: analysisLoading, error: analysisError } = usePersonalityAnalysis(chatId, personName)


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          {/* Back Button if coming from chat */}
          {chatId && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-4"
            >
              <UIButton
                onClick={() => navigate(`/chat/${chatId}`)}
                variant="outline"
                className="bg-white/10 backdrop-blur-lg border border-white/20 text-white hover:bg-white/20"
              >
                Back to Chat
              </UIButton>
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em' }}>
                Personality Analysis
                {personName && (
                  <span className="block text-2xl sm:text-3xl text-purple-300 mt-2">
                    {personName}
                  </span>
                )}
              </h1>
              <p className="text-purple-200 text-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                AI-powered insights into {personName ? `${personName}'s` : 'your'} communication style and personality
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-medium transition-all relative ${
                    activeTab === tab.id
                      ? 'text-white bg-gradient-to-r from-purple-600/50 to-blue-600/50 border-t border-x border-white/20'
                      : 'text-purple-200 hover:text-white hover:bg-white/5'
                  }`}
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          {analysisLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent mb-4"></div>
                <p className="text-purple-200">Loading personality data...</p>
              </div>
            </div>
          ) : analysisError ? (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-6 text-center">
              <p className="text-red-300">{analysisError}</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && <OverviewCard personName={personName} chatId={chatId} analysis={analysis} />}
              {activeTab === 'communication' && <CommunicationChart personName={personName} chatId={chatId} analysis={analysis} />}
              {activeTab === 'emotion' && <EmotionalTone personName={personName} chatId={chatId} analysis={analysis} />}
              {activeTab === 'activity' && <ActivityPatterns personName={personName} chatId={chatId} analysis={analysis} />}
              {activeTab === 'traits' && <PersonalityTraits personName={personName} chatId={chatId} analysis={analysis} />}
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}

