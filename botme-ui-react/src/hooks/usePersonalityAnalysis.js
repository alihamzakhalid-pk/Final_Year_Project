import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function usePersonalityAnalysis(chatId, personName) {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!chatId) {
        // Use mock data if no chatId
        setAnalysis({
          person_name: personName || 'User',
          total_messages: 0,
          metrics: {
            avg_message_length: 12,
            emoji_usage: 45,
            slang_usage: 32,
            vocabulary_richness: 68,
            sentence_complexity: 55,
          },
          communication_style: { casual: 78, formal: 22 },
          sentiment: { positive: 65, neutral: 25, negative: 10 },
          top_words: [],
          emoji_frequency: [],
          message_length_distribution: [],
          personality_traits: {
            openness: 82,
            conscientiousness: 70,
            extraversion: 45,
            agreeableness: 65,
            emotional_stability: 58,
          },
          traits_radar: []
        })
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // Ensure chatId is a number
        const numericChatId = parseInt(chatId, 10)
        if (isNaN(numericChatId)) {
          throw new Error(`Invalid chat ID: ${chatId}`)
        }
        
        console.log(`[usePersonalityAnalysis] Fetching analysis for chat ${numericChatId}`)
        const response = await api.get(`/api/personality/${numericChatId}`)
        const data = response.data

        if (data.error) {
          setError(data.error)
          setAnalysis(null)
        } else {
          setAnalysis(data)
          setError(null)
        }
      } catch (err) {
        console.error('Failed to fetch personality analysis:', err)
        
        // Provide more specific error messages
        let errorMessage = 'Failed to load personality analysis'
        
        if (err.status === 404) {
          const errorData = err.data || {}
          if (errorData.ready_chat_ids && errorData.ready_chat_ids.length > 0) {
            errorMessage = `Chat ${chatId} not found. Available chat IDs: ${errorData.ready_chat_ids.join(', ')}. Please use one of these chat IDs.`
          } else if (errorData.hint) {
            errorMessage = `${errorData.error} ${errorData.hint}`
          } else {
            errorMessage = errorData.error || `Chat ${chatId} not found. It may have been deleted or you may need to select a persona first.`
          }
        } else if (err.status === 403) {
          errorMessage = 'You do not have permission to access this chat'
        } else if (err.status === 400) {
          errorMessage = err.data?.error || 'Chat is not ready for analysis. Please ensure a persona is selected and messages exist.'
        } else if (err.status === 0) {
          errorMessage = 'Cannot connect to server. Please ensure the backend is running on http://127.0.0.1:5000'
        } else if (err.data?.error) {
          errorMessage = err.data.error
        } else if (err.message) {
          errorMessage = err.message
        }
        
        setError(errorMessage)
        setAnalysis(null)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [chatId, personName])

  return { analysis, loading, error }
}

