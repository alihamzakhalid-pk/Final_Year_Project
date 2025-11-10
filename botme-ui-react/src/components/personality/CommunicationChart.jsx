import { motion } from 'framer-motion'
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { MessageSquare, TrendingUp, BookOpen, Hash } from 'lucide-react'
import UICard from '../ui/Card'

export default function CommunicationChart({ personName, chatId, analysis }) {
  // Mock data
  const communicationData = {
    casualVsFormal: [
      { name: 'Casual', value: 78, color: '#8B5CF6' },
      { name: 'Formal', value: 22, color: '#3B82F6' },
    ],
    messageLength: [
      { range: '1-5', count: 120 },
      { range: '6-10', count: 340 },
      { range: '11-15', count: 280 },
      { range: '16-20', count: 150 },
      { range: '21+', count: 80 },
    ],
    metrics: {
      avgLength: 12,
      emojiUsage: 45,
      slangUsage: 32,
      vocabularyRichness: 68,
      sentenceComplexity: 55,
    }
  }

  const COLORS = ['#8B5CF6', '#3B82F6', '#06B6D4', '#A78BFA', '#60A5FA']

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Avg Length', value: `${communicationData.metrics.avgLength} words`, icon: MessageSquare, color: 'purple' },
          { label: 'Emoji Usage', value: `${communicationData.metrics.emojiUsage}%`, icon: Hash, color: 'blue' },
          { label: 'Slang Usage', value: `${communicationData.metrics.slangUsage}%`, icon: TrendingUp, color: 'cyan' },
          { label: 'Vocabulary', value: `${communicationData.metrics.vocabularyRichness}%`, icon: BookOpen, color: 'purple' },
          { label: 'Complexity', value: `${communicationData.metrics.sentenceComplexity}%`, icon: MessageSquare, color: 'blue' },
        ].map((metric, index) => {
          const Icon = metric.icon
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -4 }}
            >
              <UICard className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 text-center">
                <Icon 
                  className={`h-5 w-5 mx-auto mb-2 ${
                    metric.color === 'purple' ? 'text-purple-300' :
                    metric.color === 'blue' ? 'text-blue-300' :
                    'text-cyan-300'
                  }`} 
                />
                <p className="text-purple-200 text-xs mb-1">{metric.label}</p>
                <p className="text-white font-bold text-lg">{metric.value}</p>
              </UICard>
            </motion.div>
          )
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Casual vs Formal Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <UICard className="bg-white/10 backdrop-blur-xl border border-white/20 p-6">
            <h3 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Communication Style Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={communicationData.casualVsFormal}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {communicationData.casualVsFormal.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
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
              </PieChart>
            </ResponsiveContainer>
          </UICard>
        </motion.div>

        {/* Message Length Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <UICard className="bg-white/10 backdrop-blur-xl border border-white/20 p-6">
            <h3 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Message Length Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={communicationData.messageLength}>
                <XAxis 
                  dataKey="range" 
                  tick={{ fill: '#C4B5FD', fontSize: 12 }}
                  stroke="rgba(255,255,255,0.2)"
                />
                <YAxis 
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
                <Bar 
                  dataKey="count" 
                  fill="url(#colorGradient)"
                  radius={[8, 8, 0, 0]}
                >
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={1} />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </UICard>
        </motion.div>
      </div>

      {/* Vocabulary Richness Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <UICard className="bg-white/10 backdrop-blur-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Vocabulary Richness
            </h3>
            <span className="text-2xl font-bold text-purple-300">{communicationData.metrics.vocabularyRichness}%</span>
          </div>
          <div className="h-4 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${communicationData.metrics.vocabularyRichness}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
            />
          </div>
          <p className="text-purple-200 text-sm mt-2">
            Your vocabulary diversity is {communicationData.metrics.vocabularyRichness >= 70 ? 'excellent' : communicationData.metrics.vocabularyRichness >= 50 ? 'good' : 'developing'}
          </p>
        </UICard>
      </motion.div>
    </div>
  )
}

