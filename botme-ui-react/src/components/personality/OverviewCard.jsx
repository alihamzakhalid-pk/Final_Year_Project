import { motion } from 'framer-motion'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { User, MessageSquare, Smile, Clock, TrendingUp, ArrowUp, ArrowDown, Minus, Hash } from 'lucide-react'
import UICard from '../ui/Card'

export default function OverviewCard({ personName, chatId, analysis }) {
  // Transform analysis data to component format
  const userData = analysis ? {
    name: analysis.person_name || personName || 'User',
    communicationStyle: analysis.communication_style || { casual: 50, formal: 50 },
    emotionalTone: analysis.sentiment || { positive: 50, neutral: 30, negative: 20 },
    mostActive: '9PM–11PM', // TODO: Calculate from message timestamps
    avgMessageLength: analysis.metrics?.avg_message_length || 12,
    traits: {
      openness: { value: analysis.personality_traits?.openness || 50, trend: 'stable' },
      agreeableness: { value: analysis.personality_traits?.agreeableness || 50, trend: 'stable' },
      extraversion: { value: analysis.personality_traits?.extraversion || 50, trend: 'stable' },
      conscientiousness: { value: analysis.personality_traits?.conscientiousness || 50, trend: 'stable' },
      emotionalStability: { value: analysis.personality_traits?.emotional_stability || 50, trend: 'stable' },
    }
  } : null

  if (!userData) {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-6 text-center">
        <p className="text-red-300">No data available</p>
      </div>
    )
  }

  // Radar chart data
  const radarData = [
    { trait: 'Openness', value: userData.traits.openness.value, fullMark: 100 },
    { trait: 'Conscientiousness', value: userData.traits.conscientiousness.value, fullMark: 100 },
    { trait: 'Extraversion', value: userData.traits.extraversion.value, fullMark: 100 },
    { trait: 'Agreeableness', value: userData.traits.agreeableness.value, fullMark: 100 },
    { trait: 'Emotional Stability', value: userData.traits.emotionalStability.value, fullMark: 100 },
  ]

  // Get trend icon (simplified - could be enhanced with historical data)
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-4 w-4 text-green-400" />
      case 'down':
        return <ArrowDown className="h-4 w-4 text-red-400" />
      default:
        return <Minus className="h-4 w-4 text-yellow-400" />
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 items-start">
      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <UICard className="bg-white/10 backdrop-blur-xl border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-400/30">
              <User className="h-6 w-6 text-purple-300" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {userData.name}
              </h3>
              <p className="text-purple-200 text-sm">Personality Overview</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Communication Style */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <MessageSquare className="h-5 w-5 text-purple-300 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-purple-200 mb-1">Communication Style</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: `${userData.communicationStyle.casual}%` }} />
                  </div>
                  <span className="text-white text-sm font-semibold">
                    {userData.communicationStyle.casual}% Casual, {userData.communicationStyle.formal}% Formal
                  </span>
                </div>
              </div>
            </div>

            {/* Emotional Tone */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <Smile className="h-5 w-5 text-green-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-purple-200 mb-1">Emotional Tone</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: `${userData.emotionalTone.positive}%` }} />
                  </div>
                  <span className="text-white text-sm font-semibold">{userData.emotionalTone.positive}% Positive</span>
                </div>
              </div>
            </div>

            {/* Most Active */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <Clock className="h-5 w-5 text-blue-300 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-purple-200">Most Active</p>
                <p className="text-white font-semibold">{userData.mostActive}</p>
              </div>
            </div>

            {/* Avg Message Length */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <MessageSquare className="h-5 w-5 text-cyan-300 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-purple-200">Avg. Message Length</p>
                <p className="text-white font-semibold">{userData.avgMessageLength} words</p>
              </div>
            </div>

            {/* Emoji Frequency */}
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Hash className="h-4 w-4 text-purple-300" />
                <p className="text-sm text-purple-200 font-semibold">Emoji Frequency</p>
              </div>
              <div className="space-y-2">
                {(analysis?.emoji_frequency || []).slice(0, 5).map((emoji, index) => {
                  const maxCount = analysis?.emoji_frequency?.[0]?.count || 1
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-2xl flex-shrink-0">{emoji.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white text-xs font-medium capitalize">{emoji.name || 'emoji'}</span>
                          <span className="text-purple-200 text-xs font-semibold">{emoji.count}x</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(emoji.count / maxCount) * 100}%` }}
                            transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
                {(!analysis?.emoji_frequency || analysis.emoji_frequency.length === 0) && (
                  <p className="text-purple-300 text-xs italic">No emoji data available</p>
                )}
              </div>
            </div>
          </div>
        </UICard>
      </motion.div>

      {/* Radar Chart */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <UICard className="bg-white/10 backdrop-blur-xl border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-400/30">
              <TrendingUp className="h-6 w-6 text-purple-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Big Five Personality Traits
              </h3>
              <p className="text-purple-200 text-sm">Comprehensive personality analysis</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis 
                dataKey="trait" 
                tick={{ fill: '#C4B5FD', fontSize: 12, fontFamily: 'system-ui, sans-serif' }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]}
                tick={{ fill: '#A78BFA', fontSize: 10 }}
              />
              <Radar
                name="Personality"
                dataKey="value"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.6}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </UICard>
      </motion.div>
    </div>
  )
}

