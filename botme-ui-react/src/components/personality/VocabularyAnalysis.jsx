import { motion } from 'framer-motion'
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { BookOpen, Hash, Sparkles } from 'lucide-react'
import UICard from '../ui/Card'

export default function VocabularyAnalysis({ timeRange, personName, chatId, analysis }) {
  // Use real analysis data if available, otherwise use mock data
  const topWords = analysis?.top_words || [
    { word: 'hello', count: 125 },
    { word: 'thanks', count: 98 },
    { word: 'great', count: 87 },
    { word: 'sure', count: 76 },
    { word: 'okay', count: 65 },
    { word: 'nice', count: 54 },
    { word: 'yeah', count: 48 },
    { word: 'cool', count: 42 },
    { word: 'haha', count: 38 },
    { word: 'lol', count: 35 },
  ]

  const emojis = analysis?.emoji_frequency || [
    { emoji: '😊', count: 145, name: 'smile' },
    { emoji: '❤️', count: 98, name: 'heart' },
    { emoji: '👍', count: 87, name: 'thumbs up' },
    { emoji: '😂', count: 76, name: 'laughing' },
    { emoji: '😍', count: 65, name: 'heart eyes' },
  ]

  // For unique phrases, we'll use a placeholder for now
  // This could be enhanced with actual phrase extraction from messages
  const uniquePhrases = [
    'how are you',
    'thank you so much',
    'that sounds great',
    'i appreciate it',
    'no problem',
    'sounds good',
    'have a great day',
    'talk to you later',
  ]

  const vocabularyData = {
    topWords,
    emojis,
    uniquePhrases
  }

  const maxCount = topWords.length > 0 ? Math.max(...topWords.map(w => w.count)) : 1
  const maxEmojiCount = emojis.length > 0 ? Math.max(...emojis.map(e => e.count)) : 1

  return (
    <div className="space-y-6">
      {/* Top Words */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <UICard className="bg-white/10 backdrop-blur-xl border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-6 w-6 text-purple-300" />
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Top 10 Most Used Words
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={vocabularyData.topWords} layout="vertical">
              <XAxis type="number" tick={{ fill: '#C4B5FD', fontSize: 12 }} stroke="rgba(255,255,255,0.2)" />
              <YAxis 
                dataKey="word" 
                type="category" 
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
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {vocabularyData.topWords.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`hsl(${240 + index * 20}, 70%, ${60 + index * 3}%)`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </UICard>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Emoji Frequency */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <UICard className="bg-white/10 backdrop-blur-xl border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Hash className="h-6 w-6 text-blue-300" />
              <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Emoji Frequency
              </h3>
            </div>
            <div className="space-y-3">
              {vocabularyData.emojis.map((emoji, index) => (
                <motion.div
                  key={emoji.emoji}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <span className="text-3xl">{emoji.emoji}</span>
                  <div className="flex-1">
                    <p className="text-white font-medium capitalize">{emoji.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(emoji.count / maxEmojiCount) * 100}%` }}
                          transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                        />
                      </div>
                      <span className="text-purple-200 text-sm font-semibold">{emoji.count}x</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </UICard>
        </motion.div>

        {/* Word Cloud / Unique Phrases */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <UICard className="bg-white/10 backdrop-blur-xl border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="h-6 w-6 text-cyan-300" />
              <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Signature Phrases
              </h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {vocabularyData.uniquePhrases.map((phrase, index) => (
                <motion.div
                  key={phrase}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.1, y: -4 }}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 backdrop-blur-sm"
                >
                  <span className="text-white text-sm font-medium">{phrase}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-purple-200 text-sm">
                These phrases represent your unique communication style and frequently used expressions.
              </p>
            </div>
          </UICard>
        </motion.div>
      </div>
    </div>
  )
}

