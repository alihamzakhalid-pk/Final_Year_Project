import { motion } from 'framer-motion'
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { Clock, Calendar, MessageSquare, Zap } from 'lucide-react'
import UICard from '../ui/Card'

export default function ActivityPatterns({ personName, chatId, analysis }) {
  // Mock data
  const activityData = {
    hourly: [
      { hour: '12AM', messages: 5 },
      { hour: '6AM', messages: 8 },
      { hour: '9AM', messages: 25 },
      { hour: '12PM', messages: 45 },
      { hour: '3PM', messages: 38 },
      { hour: '6PM', messages: 52 },
      { hour: '9PM', messages: 78 },
      { hour: '11PM', messages: 65 },
    ],
    daily: [
      { day: 'Mon', messages: 120 },
      { day: 'Tue', messages: 145 },
      { day: 'Wed', messages: 130 },
      { day: 'Thu', messages: 160 },
      { day: 'Fri', messages: 180 },
      { day: 'Sat', messages: 200 },
      { day: 'Sun', messages: 175 },
    ],
    metrics: {
      avgResponseTime: '2.5 min',
      totalMessages: 1250,
      peakHour: '9PM',
      peakDay: 'Saturday',
    }
  }

  const getBarColor = (value, max) => {
    const ratio = value / max
    if (ratio > 0.7) return '#8B5CF6'
    if (ratio > 0.4) return '#3B82F6'
    return '#06B6D4'
  }

  const maxHourly = Math.max(...activityData.hourly.map(h => h.messages))
  const maxDaily = Math.max(...activityData.daily.map(d => d.messages))

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Messages', value: activityData.metrics.totalMessages.toLocaleString(), icon: MessageSquare, color: 'purple' },
          { label: 'Avg Response', value: activityData.metrics.avgResponseTime, icon: Clock, color: 'blue' },
          { label: 'Peak Hour', value: activityData.metrics.peakHour, icon: Zap, color: 'cyan' },
          { label: 'Peak Day', value: activityData.metrics.peakDay, icon: Calendar, color: 'purple' },
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
        {/* Hourly Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <UICard className="bg-white/10 backdrop-blur-xl border border-white/20 p-6">
            <h3 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Activity by Hour
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData.hourly}>
                <XAxis 
                  dataKey="hour" 
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
                <Bar dataKey="messages" radius={[8, 8, 0, 0]}>
                  {activityData.hourly.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.messages, maxHourly)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </UICard>
        </motion.div>

        {/* Daily Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <UICard className="bg-white/10 backdrop-blur-xl border border-white/20 p-6">
            <h3 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Activity by Day
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData.daily}>
                <XAxis 
                  dataKey="day" 
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
                <Bar dataKey="messages" radius={[8, 8, 0, 0]}>
                  {activityData.daily.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.messages, maxDaily)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </UICard>
        </motion.div>
      </div>
    </div>
  )
}

