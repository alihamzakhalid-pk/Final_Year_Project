import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { CloudUpload, Users, Shield, ArrowRight, Upload, Sparkles, MessageSquare, CheckCircle, ChevronRight, Brain, TrendingUp, Smile, BarChart3, Activity } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import BotMeLogo from '../components/BotMeLogo'
import UIButton from '../components/ui/Button'
import UICard from '../components/ui/Card'

const features = [
  {
    icon: CloudUpload,
    iconBg: '#EFF6FF',
    iconColor: '#5B7FFF',
    title: 'Bring Back Any Conversation in Seconds',
    description: 'Upload your WhatsApp chats and instantly extract all the people you\'ve talked to. No waiting, no complicated setup.',
  },
  {
    icon: Users,
    iconBg: '#F3E8FF',
    iconColor: '#A855F7',
    title: 'They Remember Everything, Just Like Real Conversations',
    description: 'Each AI persona knows your entire chat history together. They remember your inside jokes, shared memories, and unique way of talking.',
  },
  {
    icon: Shield,
    iconBg: '#ECFDF5',
    iconColor: '#10B981',
    title: 'End-to-End Encrypted. We Never Read Your Messages.',
    description: 'Your data stays private. We never read your conversations. Delete everything with one click, anytime.',
  },
]

const steps = [
  {
    icon: Upload,
    title: 'Upload Chat',
    description: 'Export your WhatsApp chat',
    detail: 'BotMe automatically identifies people from your chats',
  },
  {
    icon: Sparkles,
    title: 'Pick a Persona',
    description: 'Select who you want to talk to',
    detail: 'Choose from 1-50+ people depending on your chat history',
  },
  {
    icon: MessageSquare,
    title: 'Start Talking',
    description: 'Chat naturally with AI',
    detail: 'They remember everything from your conversations',
  },
]

const faqs = [
  {
    question: 'How accurate are the AI responses?',
    answer: 'BotMe uses advanced AI to analyze your actual chat history and learn each person\'s unique communication style, tone, and personality. Responses are based on real conversations you\'ve had, making them highly accurate and authentic.',
  },
  {
    question: 'Is my data safe and private?',
    answer: 'Yes. Your data is end-to-end encrypted and stored securely. We never read your messages. You can delete all your data with one click at any time. Your privacy is our top priority.',
  },
  {
    question: 'Can I delete my data anytime?',
    answer: 'Absolutely. You have full control over your data. You can delete individual conversations, personas, or your entire account and all associated data with one click.',
  },
  {
    question: 'Can others see my conversations?',
    answer: 'No. All your conversations are private and only accessible to you. We use industry-standard encryption and security measures to protect your data.',
  },
  {
    question: 'How many personas can I create?',
    answer: 'You can create as many personas as you have people in your chat history. Most users extract 5-20 personas from a single chat export, but it can range from 1 to 50+ depending on your conversation history.',
  },
  {
    question: 'How do I get started?',
    answer: 'Simply upload your WhatsApp chat export, and BotMe will automatically extract all the personas. You can start chatting immediately - no setup required.',
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] to-white">
      {/* Hero Section - Full Viewport Height */}
      <section className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-16 bg-gradient-to-b from-white via-[#F8FAFC] to-white">
        {/* Modern Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#6C63FF] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-[#3B82F6] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-[#8B5CF6] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex justify-center"
          >
            <BotMeLogo size={120} animated={true} showText={true} />
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            className="mx-auto text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#1F2937] leading-tight mb-6"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{ 
              lineHeight: '1.1',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              letterSpacing: '-0.03em',
              fontWeight: 800
            }}
          >
            Chat with Anyone,{' '}
            <span className="bg-gradient-to-r from-[#6C63FF] to-[#3B82F6] bg-clip-text text-transparent">
              Anytime
            </span>
          </motion.h1>

          {/* Subheadline - Clarified */}
          <motion.p
            className="mx-auto max-w-2xl text-lg sm:text-xl lg:text-2xl text-[#1F2937] leading-relaxed mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{ 
              lineHeight: '1.6',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontWeight: 500
            }}
          >
            Create AI companions from your real WhatsApp conversations.{' '}
            <span className="text-[#6C63FF] font-semibold">Powered by deep personality analysis.</span>
          </motion.p>

          {/* Example Personas */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-2 mb-6 text-sm text-[#1F2937]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <span className="px-3 py-1 bg-white/80 rounded-full border border-[#E5E7EB] text-[#1F2937]" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 600 }}>Your best friend from college</span>
            <span className="px-3 py-1 bg-white/80 rounded-full border border-[#E5E7EB] text-[#1F2937]" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 600 }}>Your late grandfather</span>
            <span className="px-3 py-1 bg-white/80 rounded-full border border-[#E5E7EB] text-[#1F2937]" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 600 }}>Your younger self</span>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex items-center justify-center mb-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <UIButton
              as={Link}
              to="/signup"
              className="rounded-full bg-gradient-to-r from-[#6C63FF] to-[#3B82F6] px-10 py-4 h-14 text-base font-bold text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-100 transition-all duration-200"
            >
              Create Your First AI Companion Free
            </UIButton>
          </motion.div>

          {/* CTA Details */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4 text-sm text-[#1F2937] font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[#10B981]" />
              <span>Takes 2 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[#10B981]" />
              <span>No setup required</span>
            </div>
          </motion.div>
      </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1F2937] mb-3" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', letterSpacing: '-0.02em' }}>Why BotMe?</h2>
            <p 
              className="text-base sm:text-lg max-w-2xl mx-auto text-[#1F2937]"
              style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 500 }}
            >
              Everything you need to bring your conversations back to life
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <UICard className="rounded-xl bg-white p-6 text-center shadow-sm hover:shadow-md transition-all duration-200 border border-[#E5E7EB] h-full">
                    <div
                      className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                      style={{ backgroundColor: feature.iconBg }}
                    >
                      <Icon className="h-7 w-7" style={{ color: feature.iconColor }} />
                    </div>
                    <h3 className="text-base font-bold mb-2 text-[#1F2937]" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 700 }}>{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-[#1F2937]" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 400 }}>{feature.description}</p>
                  </UICard>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC] border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <UICard className="rounded-xl bg-white p-8 sm:p-12 shadow-lg border border-[#E5E7EB]">
              <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-[#1F2937] mb-3" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', letterSpacing: '-0.02em' }}>Get Started in 3 Steps</h2>
              </motion.div>

              <div className="grid gap-6 md:grid-cols-3 items-start">
                {steps.map((step, index) => {
                  const Icon = step.icon
                  return (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.15, duration: 0.5 }}
                      className="relative"
                    >
                      {/* Arrow between steps (desktop only) */}
                      {index < steps.length - 1 && (
                        <div className="hidden md:block absolute top-1/2 left-full w-full -translate-x-1/2 -translate-y-1/2 z-0">
                          <ArrowRight className="h-5 w-5 text-[#5B7FFF] mx-auto" />
                        </div>
                      )}

                      <UICard className="relative z-10 rounded-xl bg-white p-6 text-center shadow-sm hover:shadow-md transition-all duration-200 border border-[#E5E7EB] h-full">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5B7FFF] text-white shadow-lg">
                          <Icon className="h-7 w-7" />
                        </div>
                        <h3 className="text-lg font-bold mb-1 text-[#1F2937]" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 700 }}>Step {index + 1}</h3>
                        <h4 className="text-base font-bold mb-2 text-[#1F2937]" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 700 }}>{step.title}</h4>
                        <p className="text-sm leading-relaxed mb-1 text-[#1F2937]" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 500 }}>{step.description}</p>
                        <p className="text-xs italic text-[#1F2937]" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 400 }}>{step.detail}</p>
                      </UICard>
                    </motion.div>
                  )
                })}
              </div>
            </UICard>
          </motion.div>
        </div>
      </section>

      {/* Personality Analysis Overview Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-400/30 mb-4">
              <Brain className="h-5 w-5 text-purple-200" />
              <span className="text-white text-sm font-semibold">AI-Powered Insights</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em' }}>
              Deep Personality Analysis
            </h2>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 500 }}>
              Understand communication styles, emotional patterns, and personality traits through advanced AI analysis
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
            {/* Communication Style */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <UICard className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 text-center h-full">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-400/30">
                  <MessageSquare className="h-7 w-7 text-purple-300" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  Communication Style
                </h3>
                <p className="text-sm text-white/80 leading-relaxed" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  Analyze casual vs formal patterns, message length, and vocabulary richness
                </p>
              </UICard>
            </motion.div>

            {/* Emotional Tone */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <UICard className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 text-center h-full">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30">
                  <Smile className="h-7 w-7 text-green-300" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  Emotional Tone
                </h3>
                <p className="text-sm text-white/80 leading-relaxed" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  Sentiment analysis showing positive, neutral, and negative emotional patterns
                </p>
              </UICard>
            </motion.div>

            {/* Activity Patterns */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <UICard className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 text-center h-full">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30">
                  <Activity className="h-7 w-7 text-blue-300" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  Activity Patterns
                </h3>
                <p className="text-sm text-white/80 leading-relaxed" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  Discover most active times, response patterns, and messaging frequency
                </p>
              </UICard>
            </motion.div>

            {/* Personality Traits */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <UICard className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 text-center h-full">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30">
                  <Brain className="h-7 w-7 text-purple-300" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  Big Five Traits
                </h3>
                <p className="text-sm text-white/80 leading-relaxed" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  Comprehensive personality analysis using the Big Five model
                </p>
              </UICard>
            </motion.div>
          </div>

          {/* Preview Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <UICard className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Left: Stats Preview */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    Key Insights Preview
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/90 text-sm font-medium">Communication Style</span>
                        <span className="text-white font-semibold">78% Casual</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: '78%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/90 text-sm font-medium">Emotional Tone</span>
                        <span className="text-white font-semibold">65% Positive</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: '65%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.4 }}
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/90 text-sm font-medium">Avg. Message Length</span>
                        <span className="text-white font-semibold">12 words</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/90 text-sm font-medium">Most Active</span>
                        <span className="text-white font-semibold">9PM-11PM</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Radar Chart Preview */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    Personality Traits
                  </h3>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <ResponsiveContainer width="100%" height={280}>
                      <RadarChart data={[
                        { trait: 'Openness', value: 82, fullMark: 100 },
                        { trait: 'Conscientiousness', value: 70, fullMark: 100 },
                        { trait: 'Extraversion', value: 45, fullMark: 100 },
                        { trait: 'Agreeableness', value: 65, fullMark: 100 },
                        { trait: 'Emotional Stability', value: 58, fullMark: 100 },
                      ]}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis 
                          dataKey="trait" 
                          tick={{ fill: '#C4B5FD', fontSize: 11, fontFamily: 'system-ui, sans-serif' }}
                        />
                        <PolarRadiusAxis 
                          angle={90} 
                          domain={[0, 100]}
                          tick={{ fill: '#A78BFA', fontSize: 9 }}
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
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <UIButton
                  as={Link}
                  to="/signup"
                  className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3 text-white font-bold hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                >
                  Explore Full Analysis Dashboard
                  <ArrowRight className="h-5 w-5 ml-2 inline" />
                </UIButton>
              </div>
            </UICard>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#E5E7EB]">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1F2937] mb-3" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', letterSpacing: '-0.02em' }}>Frequently Asked Questions</h2>
            <p 
              className="text-base sm:text-lg text-[#1F2937]"
              style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 500 }}
            >
              Everything you need to know about BotMe
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <UICard className="rounded-xl bg-white p-6 shadow-sm border border-[#E5E7EB]">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <h3 className="text-lg font-bold text-[#1F2937] pr-4" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 700 }}>{faq.question}</h3>
                    <ChevronRight
                      className={`h-5 w-5 text-[#1F2937] flex-shrink-0 transition-transform ${
                        openFaq === index ? 'transform rotate-90' : ''
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 text-[#1F2937] leading-relaxed"
                      style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 400 }}
                    >
                      {faq.answer}
                    </motion.p>
                  )}
                </UICard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#5B7FFF] to-[#A855F7] text-white border-t border-[#E5E7EB]">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', letterSpacing: '-0.02em' }}>
            Ready to bring your conversations back to life?
          </h2>
          <p className="text-base sm:text-lg mb-6 text-white" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 500 }}>
            Start creating AI companions from your WhatsApp chats today
          </p>
          <UIButton
            as={Link}
            to="/signup"
            variant="outline"
            className="rounded-full bg-white px-12 py-5 h-16 text-lg font-bold !text-[#5B7FFF] border-0 shadow-lg hover:bg-gray-100 hover:shadow-xl hover:scale-105 active:scale-100 transition-all duration-200"
          >
            Create Your First AI Companion Free
          </UIButton>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-white font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-white" />
              <span>Takes 2 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-white" />
              <span>No setup required</span>
            </div>
          </div>
        </motion.div>
      </section>
      </div>
  )
}
