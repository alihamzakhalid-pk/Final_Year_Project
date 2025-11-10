import { motion } from 'framer-motion'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { Brain, TrendingUp, Info } from 'lucide-react'
import UICard from '../ui/Card'

export default function PersonalityTraits({ personName, chatId, analysis }) {
  // Use real analysis data if available, otherwise use mock data
  const traits = analysis?.personality_traits || {
    openness: 50,
    conscientiousness: 50,
    extraversion: 50,
    agreeableness: 50,
    emotional_stability: 50,
  }

  const traitsRadar = analysis?.traits_radar || [
    { trait: 'Openness', value: traits.openness, fullMark: 100 },
    { trait: 'Conscientiousness', value: traits.conscientiousness, fullMark: 100 },
    { trait: 'Extraversion', value: traits.extraversion, fullMark: 100 },
    { trait: 'Agreeableness', value: traits.agreeableness, fullMark: 100 },
    { trait: 'Emotional Stability', value: traits.emotional_stability, fullMark: 100 },
  ]

  const getTraitDescription = (traitName, value) => {
    const descriptions = {
      'Openness': value >= 70 ? 'High creativity, curiosity, and willingness to try new things' : value >= 50 ? 'Moderate openness to new experiences and ideas' : 'Prefers familiar routines and traditional approaches',
      'Conscientiousness': value >= 70 ? 'Organized, disciplined, and goal-oriented' : value >= 50 ? 'Moderately organized with balanced planning' : 'Flexible and spontaneous approach to tasks',
      'Extraversion': value >= 70 ? 'Highly social, energetic, and outgoing' : value >= 50 ? 'Moderate social energy, balanced between introversion and extraversion' : 'Prefers quiet environments and smaller social circles',
      'Agreeableness': value >= 70 ? 'Cooperative, empathetic, and trusting of others' : value >= 50 ? 'Generally cooperative with balanced assertiveness' : 'More independent and direct in interactions',
      'Emotional Stability': value >= 70 ? 'Calm, resilient, and handles stress well' : value >= 50 ? 'Moderate emotional resilience and stress management' : 'More sensitive to stress and emotional fluctuations',
    }
    return descriptions[traitName] || 'Balanced trait expression'
  }

  const traitsData = {
    radar: traitsRadar,
    detailed: [
      { 
        trait: 'Openness', 
        value: traits.openness, 
        description: getTraitDescription('Openness', traits.openness),
        color: '#8B5CF6'
      },
      { 
        trait: 'Conscientiousness', 
        value: traits.conscientiousness, 
        description: getTraitDescription('Conscientiousness', traits.conscientiousness),
        color: '#3B82F6'
      },
      { 
        trait: 'Extraversion', 
        value: traits.extraversion, 
        description: getTraitDescription('Extraversion', traits.extraversion),
        color: '#06B6D4'
      },
      { 
        trait: 'Agreeableness', 
        value: traits.agreeableness, 
        description: getTraitDescription('Agreeableness', traits.agreeableness),
        color: '#A78BFA'
      },
      { 
        trait: 'Emotional Stability', 
        value: traits.emotional_stability, 
        description: getTraitDescription('Emotional Stability', traits.emotional_stability),
        color: '#60A5FA'
      },
    ]
  }

  return (
    <div className="space-y-6">
      {/* Radar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <UICard className="bg-white/10 backdrop-blur-xl border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="h-6 w-6 text-purple-300" />
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Big Five Personality Traits
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={traitsData.radar}>
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

      {/* Detailed Traits */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {traitsData.detailed.map((trait, index) => (
          <motion.div
            key={trait.trait}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
          >
            <UICard className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 h-full">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {trait.trait}
                </h4>
                <div className="px-3 py-1 rounded-full bg-white/10">
                  <span className="text-white font-bold">{trait.value}%</span>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${trait.value}%` }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${trait.color}, ${trait.color}88)` }}
                  />
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-purple-300 flex-shrink-0 mt-0.5" />
                <p className="text-purple-200 text-sm leading-relaxed">{trait.description}</p>
              </div>
            </UICard>
          </motion.div>
        ))}
      </div>

      {/* Bar Chart Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <UICard className="bg-white/10 backdrop-blur-xl border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="h-6 w-6 text-blue-300" />
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Traits Comparison
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={traitsData.detailed}>
              <XAxis 
                dataKey="trait" 
                tick={{ fill: '#C4B5FD', fontSize: 11 }}
                stroke="rgba(255,255,255,0.2)"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fill: '#C4B5FD', fontSize: 12 }}
                stroke="rgba(255,255,255,0.2)"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(139, 92, 246, 0.95)', 
                  border: '1px solid rgba(139, 92, 246, 0.5)',
                  borderRadius: '8px',
                  color: '#fff',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#fff', fontWeight: 'bold' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {traitsData.detailed.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </UICard>
      </motion.div>
    </div>
  )
}

