import { useState, useEffect } from 'react'
import { Smile, Frown, Meh } from 'lucide-react'
import api from '../api/axios'

const MoodSelector = ({ chatId, currentMood, onMoodChange }) => {
  const [moods, setMoods] = useState({})
  const [loading, setLoading] = useState(false)
  const [selectedMood, setSelectedMood] = useState(currentMood || 'natural')

  // Mood configurations with icons
  const moodIcons = {
    natural: Meh,
    happy: Smile,
    sad: Frown
  }

  // Fetch available moods on component mount
  useEffect(() => {
    const fetchMoods = async () => {
      try {
        const response = await api.get('/api/moods')
        setMoods(response.data.moods)
      } catch (error) {
        console.error('Failed to fetch moods:', error)
      }
    }
    fetchMoods()
  }, [])

  // Update selected mood when currentMood prop changes
  useEffect(() => {
    setSelectedMood(currentMood || 'natural')
  }, [currentMood])

  const handleMoodSelect = async (moodKey) => {
    if (loading || moodKey === selectedMood) return

    setLoading(true)
    try {
      const response = await api.post(`/api/chat/${chatId}/mood`, { mood: moodKey })
      setSelectedMood(moodKey)
      if (onMoodChange) {
        onMoodChange(moodKey, response.data)
      }
    } catch (error) {
      console.error('Failed to change mood:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
      <span className="text-sm font-medium text-gray-700 mr-2">Mood:</span>

      <div className="flex gap-1">
        {Object.entries(moods).map(([moodKey, moodData]) => {
          const IconComponent = moodIcons[moodKey] || Meh
          const isSelected = selectedMood === moodKey

          return (
            <button
              key={moodKey}
              onClick={() => handleMoodSelect(moodKey)}
              disabled={loading}
              className={`
                flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                ${isSelected
                  ? 'bg-blue-100 text-blue-800 border-2 border-blue-300 shadow-sm'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                }
                ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              style={{
                borderColor: isSelected ? moodData.color : undefined,
                backgroundColor: isSelected ? `${moodData.color}20` : undefined
              }}
              title={moodData.description}
            >
              <IconComponent size={16} />
              <span>{moodData.emoji}</span>
              <span className="hidden sm:inline">{moodData.name}</span>
            </button>
          )
        })}
      </div>

      {loading && (
        <div className="ml-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
        </div>
      )}
    </div>
  )
}

export default MoodSelector