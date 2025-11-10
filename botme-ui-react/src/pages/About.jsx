import { motion } from 'framer-motion'
import { Sparkles, Shield, Zap, Users, Code, Database } from 'lucide-react'
import UICard from '../components/ui/Card'
import UIButton from '../components/ui/Button'
import { Link } from 'react-router-dom'

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Personas',
    description: 'Transform chat transcripts into intelligent personas that understand context, tone, and conversation style.',
    color: 'primary',
  },
  {
    icon: Zap,
    title: 'Lightning Fast Analysis',
    description: 'Upload and analyze chat files in seconds. Our optimized pipeline processes transcripts efficiently.',
    color: 'warning',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your data stays secure. All processing happens in your workspace with encryption-ready architecture.',
    color: 'success',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Share insights, collaborate on analysis, and build persona libraries with your team.',
    color: 'info',
  },
]

const steps = [
  { number: 1, title: 'Upload Chat', description: 'Drag and drop your WhatsApp or Messenger export (.txt file)' },
  { number: 2, title: 'Extract Personas', description: 'AI analyzes participants, tone, and conversation patterns' },
  { number: 3, title: 'Select Persona', description: 'Choose which participant you want the AI to emulate' },
  { number: 4, title: 'Start Chatting', description: 'Have contextual conversations with AI that knows the context' },
]

export default function About() {
  return (
    <section className="space-y-16">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-secondary-600 to-primary-700 p-12 text-white shadow-2xl"
      >
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold sm:text-5xl">About BotMe</h1>
          <p className="mt-4 max-w-2xl text-lg opacity-90">
            Transform raw chat transcripts into intelligent, persona-aware AI conversations. Built for analysts, researchers, and teams who need context-rich dialogue.
          </p>
          <div className="mt-6 flex gap-4">
            <UIButton as={Link} to="/signup" className="bg-white !text-[#6C63FF] hover:bg-slate-100 font-semibold px-6 py-3">
              Get Started
            </UIButton>
            <UIButton as={Link} to="/help" className="border-2 border-white/30 !text-white hover:bg-white/10 font-semibold px-6 py-3">
              Learn More
            </UIButton>
          </div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <div>
        <h2 className="mb-8 text-2xl font-bold text-slate-900 dark:text-white">Key Features</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <UICard hover className="h-full">
                  <div className={`mb-4 inline-flex rounded-lg p-3 ${
                    feature.color === 'primary' ? 'bg-primary-100 dark:bg-primary-900/30' :
                    feature.color === 'warning' ? 'bg-warning-100 dark:bg-warning-900/30' :
                    feature.color === 'success' ? 'bg-success-100 dark:bg-success-900/30' :
                    'bg-info-100 dark:bg-info-900/30'
                  }`}>
                    <Icon className={`h-6 w-6 ${
                      feature.color === 'primary' ? 'text-primary-600 dark:text-primary-400' :
                      feature.color === 'warning' ? 'text-warning-600 dark:text-warning-400' :
                      feature.color === 'success' ? 'text-success-600 dark:text-success-400' :
                      'text-info-600 dark:text-info-400'
                    }`} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
                </UICard>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* How It Works */}
      <div>
        <h2 className="mb-8 text-2xl font-bold text-slate-900 dark:text-white">How It Works</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <UICard className="relative h-full text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-lg font-bold text-white">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{step.description}</p>
              </UICard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Technology Stack */}
      <UICard className="border-2 border-slate-200 dark:border-slate-800">
        <h3 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Technology Stack</h3>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Code className="h-6 w-6 text-primary-600" />
              <p className="text-lg font-semibold text-slate-900 dark:text-white">Frontend</p>
            </div>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
                React 18 with functional hooks
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
                React Router for authenticated routing
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
                Tailwind CSS with custom design system
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
                Framer Motion for smooth animations
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
                Lucide React for modern icons
              </li>
            </ul>
          </div>
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Database className="h-6 w-6 text-secondary-600" />
              <p className="text-lg font-semibold text-slate-900 dark:text-white">Backend Integration</p>
            </div>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary-600" />
                Flask API with SQLAlchemy ORM
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary-600" />
                LangChain for AI persona emulation
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary-600" />
                OpenAI API integration
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary-600" />
                Secure token-based authentication
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary-600" />
                Vite proxy for seamless API calls
              </li>
            </ul>
          </div>
        </div>
      </UICard>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-600 p-12 text-center text-white shadow-xl"
      >
        <h2 className="text-3xl font-bold">Ready to get started?</h2>
        <p className="mt-4 text-lg opacity-90">
          Upload your first chat transcript and experience persona-aware AI conversations.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <UIButton as={Link} to="/signup" size="lg" className="bg-white !text-[#6C63FF] hover:bg-slate-100 font-semibold px-8 py-4">
            Create Account
          </UIButton>
          <UIButton as={Link} to="/dashboard" size="lg" className="border-2 border-white/30 !text-white hover:bg-white/10 font-semibold px-8 py-4">
            Go to Dashboard
          </UIButton>
        </div>
      </motion.div>
    </section>
  )
}

