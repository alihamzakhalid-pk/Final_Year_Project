import { motion } from 'framer-motion'
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Area, AreaChart } from 'recharts'
import { Smile, Frown, Meh, TrendingUp } from 'lucide-react'
import UICard from '../ui/Card'

export default function EmotionalTone({ personName, chatId, analysis }) {
  // Mock data
  const sentimentData = {
    distribution: [
      { name: 'Positive', value: 65, color: '#10B981' },
      { name: 'Neutral', value: 25, color: '#6B7280' },
      { name: 'Negative', value: 10, color: '#EF4444' },
    ],
    trend: [
      { date: 'Week 1', positive: 60, neutral: 28, negative: 12 },
      { date: 'Week 2', positive: 62, neutral: 26, negative: 12 },
      { date: 'Week 3', positive: 64, neutral: 25, negative: 11 },
      { date: 'Week 4', positive: 65, neutral: 25, negative: 10 },
    ],
    keywords: [
      { word: 'happy', count: 45, sentiment: 'positive' },
      { word: 'great', count: 38, sentiment: 'positive' },
      { word: 'thanks', count: 32, sentiment: 'positive' },
      { word: 'okay', count: 28, sentiment: 'neutral' },
      { word: 'sad', count: 15, sentiment: 'negative' },
      { word: 'tired', count: 12, sentiment: 'negative' },
    ]
  }

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <Smile className="h-4 w-4 text-green-400" />
      case 'negative':
        return <Frown className="h-4 w-4 text-red-400" />
      default:
        return <Meh className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Sentiment Distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <UICard className="bg-white/10 backdrop-blur-xl border border-white/20 p-6">
            <h3 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Sentiment Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData.distribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.distribution.map((entry, index) => (
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

        {/* Sentiment Trend */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <UICard className="bg-white/10 backdrop-blur-xl border border-white/20 p-6">
            <h3 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Sentiment Trend Over Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={sentimentData.trend}>
                <defs>
                  <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6B7280" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6B7280" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
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
                <Area type="monotone" dataKey="positive" stroke="#10B981" fillOpacity={1} fill="url(#colorPositive)" />
                <Area type="monotone" dataKey="neutral" stroke="#6B7280" fillOpacity={1} fill="url(#colorNeutral)" />
                <Area type="monotone" dataKey="negative" stroke="#EF4444" fillOpacity={1} fill="url(#colorNegative)" />
                <Legend 
                  wrapperStyle={{ color: '#C4B5FD' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </UICard>
        </motion.div>
      </div>

      {/* Emotion Keywords */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <UICard className="bg-white/10 backdrop-blur-xl border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="h-6 w-6 text-purple-300" />
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Emotion-Triggering Keywords
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {sentimentData.keywords.map((keyword, index) => (
              <motion.div
                key={keyword.word}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className={`p-4 rounded-lg border ${
                  keyword.sentiment === 'positive' ? 'bg-green-500/10 border-green-500/30' :
                  keyword.sentiment === 'negative' ? 'bg-red-500/10 border-red-500/30' :
                  'bg-gray-500/10 border-gray-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold capitalize">{keyword.word}</span>
                  {getSentimentIcon(keyword.sentiment)}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(keyword.count / 50) * 100}%` }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                      className={`h-full rounded-full ${
                        keyword.sentiment === 'positive' ? 'bg-green-500' :
                        keyword.sentiment === 'negative' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`}
                    />
                  </div>
                  <span className="text-purple-200 text-sm">{keyword.count}x</span>
                </div>
              </motion.div>
            ))}
          </div>
        </UICard>
      </motion.div>
    </div>
  )
}

