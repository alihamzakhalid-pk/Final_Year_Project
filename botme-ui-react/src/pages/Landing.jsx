import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Activity,
  Brain,
  CheckCircle,
  ChevronDown,
  CloudUpload,
  MessageSquare,
  Shield,
  Smile,
  Sparkles,
  Upload,
  Users,
} from 'lucide-react'
import BotMeLogo from '../components/BotMeLogo'
import UIButton from '../components/ui/Button'
import UICard from '../components/ui/Card'

const DESIGN_SYSTEM = {
  spacing: {
    section: 'py-16 px-4 sm:px-6 lg:px-12',
    sectionTight: 'py-12 px-4 sm:px-6 lg:px-12',
    gap: 'gap-8',
  },
  colors: {
    primary: '#5B7FFF',
    secondary: '#7C3AED',
    accent: '#0EA5E9',
    surface: '#F7F9FB',
    surfaceAlt: '#FFFFFF',
    textMain: '#0F172A',
    textMuted: '#64748B',
  },
  borderRadius: 'rounded-3xl',
  shadow: 'shadow-[0_28px_60px_rgba(15,23,42,0.12)]',
}

const HERO_MESSAGES = [
  {
    id: 1,
    sender: 'Ali',
    content: 'Bhai yaad hai humari Murree wali chill trip?',
    time: 'Abhi',
    isUser: false,
  },
  {
    id: 2,
    sender: 'You',
    content: 'Kaise bhooloon! Tune guitar pe “Wonderwall” baja ke sab ko chup karwa diya tha.',
    time: 'Abhi',
    isUser: true,
  },
  {
    id: 3,
    sender: 'Ali',
    content: 'Is weekend thora free ho? Ek chai session plan karte hain 👊',
    time: 'Abhi',
    isUser: false,
  },
]

const HERO_STATS = [
  { label: 'Personas revived', value: '150+' },
  { label: 'Avg. response match', value: '92%' },
  { label: 'Data deletion control', value: '1-click' },
]

const features = [
  {
    icon: CloudUpload,
    title: 'Upload once, revive instantly',
    description:
      "Import WhatsApp chats in seconds. BotMe automatically detects every persona and prepares them for conversation—no manual setup.",
    accent: 'from-[#EEF2FF] via-[#E0EAFF] to-[#F5F3FF]',
  },
  {
    icon: Users,
    title: 'Conversations that remember',
    description:
      'Each AI persona keeps your shared memories, tone, and shorthand alive so chats feel natural and personal every time.',
    accent: 'from-[#ECFEFF] via-[#E0F2FE] to-[#F0F9FF]',
  },
  {
    icon: Shield,
    title: 'Privacy by default',
    description:
      'End-to-end encryption and on-demand deletion. Your messages stay yours, always. We never read or store beyond your control.',
    accent: 'from-[#F5F3FF] via-[#EDE9FE] to-[#EEF2FF]',
  },
  {
    icon: Sparkles,
    title: 'Personalities you can fine-tune',
    description:
      'Adjust tone, energy, and memory depth with a slider. Save multiple variations for the same person in one clean workspace.',
    accent: 'from-[#FDF2F8] via-[#FAE8FF] to-[#F5F3FF]',
  },
]

const steps = [
  {
    number: '01',
    icon: Upload,
    title: 'Upload your chat',
    description: 'Drop in your exported WhatsApp file. BotMe handles clean-up and persona extraction.',
    detail: 'Supports individual and group chats',
  },
  {
    number: '02',
    icon: Sparkles,
    title: 'Select the personas',
    description: 'Pick who you want to speak to again and adjust their tone, energy, or memory depth.',
    detail: 'Preview personalities before saving',
  },
  {
    number: '03',
    icon: MessageSquare,
    title: 'Start talking instantly',
    description: 'Chat in a modern UI with typing indicators, smart suggestions, and message history.',
    detail: 'Responses feel like the person you remember',
  },
]

const personalityTraits = [
  {
    icon: MessageSquare,
    name: 'Communication Style',
    value: 88,
    color: 'from-[#6366F1] to-[#22D3EE]',
  },
  {
    icon: Smile,
    name: 'Emotional Tone',
    value: 73,
    color: 'from-[#22C55E] to-[#14B8A6]',
  },
  {
    icon: Activity,
    name: 'Activity Pattern',
    value: 94,
    color: 'from-[#2563EB] to-[#38BDF8]',
  },
]

const faqs = [
  {
    question: 'How accurate are the AI responses?',
    answer:
      "BotMe analyses your phrasing, cadence, reactions, and emoji use to recreate authentic replies. Most users rate the match above 90% after the first session.",
  },
  {
    question: 'Is my data safe and private?',
    answer:
      'Yes. Chats are encrypted at rest and in transit. You choose where your data is stored and can trigger auto-deletion whenever you like.',
  },
  {
    question: 'Can I delete my data anytime?',
    answer:
      'Absolutely. Wipe a single persona, clear a conversation, or remove your entire workspace with one click from the dashboard.',
  },
  {
    question: 'Can others see my conversations?',
    answer:
      'No. Every workspace is private. We never reuse, sell, or human-review your conversations—ever.',
  },
  {
    question: 'How many personas can I create?',
    answer:
      'As many as your chat history includes. Power users revive 25+ personas from a single WhatsApp export without any slowdown.',
  },
  {
    question: 'How do I get started?',
    answer:
      'Upload your chat, preview the extracted personalities, and press start. You can set up your first conversation in under two minutes.',
  },
]

const CTAButton = ({ children = 'Start for free', variant = 'ghost', to = '/signup', className = '', ...props }) => (
  <UIButton
    as={Link}
    to={to}
    variant={variant}
    size="lg"
    className={`rounded-2xl px-6 sm:px-8 py-3.5 font-semibold ${DESIGN_SYSTEM.shadow} hover:shadow-xl ${className}`}
    {...props}
  >
    {children}
  </UIButton>
)

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="min-h-screen bg-[#F2F5FA] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl">
        <motion.nav
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-12"
        >
          <Link to="/" className="flex items-center">
            <BotMeLogo
              size={64}
              animated
              showText
              className="rounded-3xl bg-white/90 px-4 py-2.5 shadow-[0_8px_30px_rgba(91,127,255,0.25),0_4px_12px_rgba(124,58,237,0.15)] ring-1 ring-white/80 backdrop-blur-sm"
            />
          </Link>
          <div className="hidden items-center gap-4 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="rounded-xl px-3 py-2 transition-colors hover:bg-slate-100 hover:text-slate-900">
              Features
            </a>
            <a href="#how-it-works" className="rounded-xl px-3 py-2 transition-colors hover:bg-slate-100 hover:text-slate-900">
              How it works
            </a>
            <a href="#insights" className="rounded-xl px-3 py-2 transition-colors hover:bg-slate-100 hover:text-slate-900">
              Insights
            </a>
            <Link to="/login" className="rounded-xl px-3 py-2 transition-colors hover:bg-slate-100 hover:text-slate-900">
              Log in
            </Link>
            <CTAButton
              variant="ghost"
              className="!shadow-none bg-gradient-to-r from-[#5B7FFF] via-[#6D5DFF] to-[#7C3AED] text-white hover:scale-[1.02]"
            />
          </div>
          <Link to="/signup" className="md:hidden">
            <UIButton variant="primary" size="md">
              Join now
            </UIButton>
          </Link>
        </motion.nav>
      </header>

      <main>
        <section className={`relative overflow-hidden bg-gradient-to-br from-white via-[#EEF3FF] to-white ${DESIGN_SYSTEM.spacing.section}`}>
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 -right-24 h-72 w-72 rounded-full bg-[#5B7FFF]/20 blur-3xl" />
            <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#7C3AED]/20 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-12">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8 lg:col-span-6 xl:col-span-5"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/60 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 shadow-sm">
                Human conversations, reimagined
              </div>
              <h1
                className="text-4xl font-black leading-tight text-[#0F172A] sm:text-5xl lg:text-[3.5rem]"
                style={{ letterSpacing: '-0.04em' }}
              >
                Bring past conversations back to life with living personas.
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-slate-600 sm:text-xl">
                Upload a chat once. BotMe rebuilds the tone, timing, and personality of the people you care about so every reply feels
                instantly familiar.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <CTAButton className="bg-gradient-to-r from-[#5B7FFF] via-[#6D5DFF] to-[#7C3AED] text-white" />
                <UIButton
                  as="a"
                  href="#how-it-works"
                  variant="outline"
                  size="lg"
                  className="rounded-2xl border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-900 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#5B7FFF] hover:text-[#111C44]"
                >
                  See how it works
                </UIButton>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {HERO_STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-200/60 bg-white px-5 py-4 shadow-sm transition-transform duration-200 hover:-translate-y-1"
                  >
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="relative lg:col-span-6 lg:col-start-7 xl:col-span-7"
            >
              <div className="pointer-events-none absolute -top-10 left-16 hidden h-32 w-32 rounded-full bg-[#0EA5E9]/10 blur-2xl lg:block" />
              <div className="pointer-events-none absolute bottom-10 -right-12 hidden h-28 w-28 rounded-full bg-[#7C3AED]/10 blur-2xl lg:block" />

              <div className="relative rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-xl shadow-slate-900/10 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-slate-200 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#5B7FFF] to-[#7C3AED] font-semibold text-white">
                      S
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Ali Khan</p>
                      <div className="flex items-center gap-2 text-xs text-emerald-500">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        Online now
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs text-slate-400">
                    <span className="rounded-full bg-slate-100 px-3 py-1">Tone • Warm</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">Memory • Deep</span>
                  </div>
                </div>

                <div className="space-y-4 py-6">
                  {HERO_MESSAGES.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, x: message.isUser ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 * index }}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow ${message.isUser
                            ? 'bg-gradient-to-r from-[#5B7FFF] to-[#7C3AED] text-white shadow-[#5B7FFF]/40'
                            : 'bg-slate-50 text-slate-700 shadow-slate-200'
                          }`}
                      >
                        <span className="block font-medium">{message.content}</span>
                        <span className="mt-1 block text-xs opacity-70">{message.time}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-400">
                  Suggestion • “The photos are in our shared folder — want me to resend?”
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="features" className={`${DESIGN_SYSTEM.spacing.section} bg-white`}>
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6 }}
              className="mx-auto mb-14 max-w-2xl text-center"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-[#EEF2FF] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#5B7FFF]">
                Why BotMe works
              </div>
              <h2 className="mt-6 text-3xl font-bold text-slate-900 sm:text-4xl">
                Built for conversations that matter, without clutter or guesswork.
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Every surface follows the same rhythm: clear typography, smooth motion, and contrast-checked palettes that stay readable
                on every screen.
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ delay: index * 0.08, duration: 0.5 }}
                  >
                    <UICard
                      className={`${DESIGN_SYSTEM.borderRadius} border border-slate-100 bg-gradient-to-br ${feature.accent} p-8 shadow-lg shadow-slate-900/5 transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl`}
                    >
                      <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#5B7FFF] shadow-sm">
                        <Icon className="h-6 w-6" strokeWidth={2} />
                      </div>
                      <h3 className="mb-3 text-xl font-semibold text-slate-900">{feature.title}</h3>
                      <p className="text-base text-slate-600">{feature.description}</p>
                    </UICard>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        <section id="how-it-works" className={`${DESIGN_SYSTEM.spacing.section} bg-[#EEF3FF]`}>
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6 }}
              className="mx-auto mb-12 max-w-xl text-center"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#7C3AED] shadow-sm shadow-slate-900/10">
                Three smooth steps
              </div>
              <h2 className="mt-6 text-3xl font-bold text-slate-900 sm:text-4xl">From upload to lifelike chats in minutes.</h2>
              <p className="mt-4 text-lg text-slate-600">
                Every stage is guided. Simply follow the prompts, preview the persona, and press start.
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="relative"
                  >
                    {index < steps.length - 1 && (
                      <div className="absolute right-0 top-1/2 hidden h-px w-full translate-x-1/2 bg-gradient-to-r from-[#5B7FFF]/0 via-[#5B7FFF]/40 to-[#5B7FFF]/0 md:block" />
                    )}
                    <UICard className="relative z-10 h-full rounded-[28px] border border-white bg-white/80 p-8 shadow-md backdrop-blur-xl transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl">
                      <div className="mb-8 flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5B7FFF] to-[#7C3AED] text-white shadow-lg">
                          {step.number}
                        </div>
                        <div className="rounded-2xl bg-[#EEF3FF] p-3 text-[#5B7FFF]">
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>
                      <h3 className="mb-3 text-xl font-semibold text-slate-900">{step.title}</h3>
                      <p className="mb-2 text-base text-slate-600">{step.description}</p>
                      <p className="text-sm font-medium text-slate-500">{step.detail}</p>
                    </UICard>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        <section id="insights" className={`${DESIGN_SYSTEM.spacing.section} bg-white`}>
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6 }}
              className="mx-auto mb-14 max-w-3xl text-center"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-[#F0F9FF] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#0EA5E9]">
                Personality insights
              </div>
              <h2 className="mt-6 text-3xl font-bold text-slate-900 sm:text-4xl">
                Understand how every persona speaks before you send a single message.
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Deep personality breakdowns reveal tone, pacing, sentiment, and memory cues. Fine-tune them to keep the conversation
                feeling true-to-life.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6 }}
              className="rounded-[34px] border border-slate-100 bg-gradient-to-br from-white via-[#F8FBFF] to-white p-10 shadow-xl shadow-slate-900/5"
            >
              <div className="grid gap-10 lg:grid-cols-3">
                {personalityTraits.map((trait, index) => {
                  const Icon = trait.icon
                  return (
                    <motion.div
                      key={trait.name}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ delay: index * 0.12, duration: 0.5 }}
                      className="rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-sm"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF3FF] text-[#5B7FFF]">
                            <Icon className="h-6 w-6" strokeWidth={2} />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-slate-500">Persona trait</p>
                            <h3 className="text-lg font-semibold text-slate-900">{trait.name}</h3>
                          </div>
                        </div>
                        <span className="text-xl font-bold text-slate-900">{trait.value}%</span>
                      </div>
                      <p className="text-sm text-slate-500">
                        BotMe tracks phrasing, response time, and emoji density to shape this persona. Adjust the sliders to get the tone
                        you expect.
                      </p>
                      <div className="mt-5 h-3 rounded-full bg-slate-100">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${trait.value}%` }}
                          viewport={{ once: true, amount: 0.4 }}
                          transition={{ duration: 0.7, delay: 0.2 }}
                          className={`h-full rounded-full bg-gradient-to-r ${trait.color}`}
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              <div className="mt-10 flex flex-col items-center justify-between gap-6 rounded-3xl border border-slate-200 bg-white/70 p-6 text-center shadow-inner shadow-slate-900/5 md:flex-row md:text-left">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Control panel</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                    Tweak a persona live and see how the tone shifts in real time.
                  </h3>
                  <p className="mt-2 text-slate-500">
                    Activate Focus Mode to view message samples, sentiment graphs, and conversation triggers side-by-side.
                  </p>
                </div>
                <CTAButton className="bg-gradient-to-r from-[#0EA5E9] via-[#5B7FFF] to-[#7C3AED] text-white">
                  Explore the dashboard
                </CTAButton>
              </div>
            </motion.div>
          </div>
        </section>

        <section className={`${DESIGN_SYSTEM.spacing.section} bg-[#F7F9FB]`}>
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Frequently asked questions</h2>
              <p className="mt-3 text-lg text-slate-600">
                Clear answers so you feel confident before you upload anything.
              </p>
            </motion.div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                >
                  <UICard className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-slate-50"
                    >
                      <span className="text-lg font-semibold text-slate-900">{faq.question}</span>
                      <ChevronDown
                        className={`h-6 w-6 text-slate-400 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {openFaq === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="border-t border-slate-200/70 px-6 py-5 text-base leading-relaxed text-slate-600">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </UICard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className={`${DESIGN_SYSTEM.spacing.section} bg-gradient-to-br from-[#0EA5E9] via-[#5B7FFF] to-[#7C3AED] text-white`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl text-center"
          >
            <h2 className="text-3xl font-bold sm:text-4xl">
              Ready to meet the people you miss, exactly how you remember them?
            </h2>
            <p className="mt-4 text-lg text-white/85">
              Upload a single chat export and you’ll be chatting in less time than it takes to brew coffee.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <UIButton
                as={Link}
                to="/signup"
                variant="ghost"
                size="lg"
                className="rounded-2xl border border-white/60 bg-white/95 px-6 py-3.5 font-semibold !text-[#3451E6] shadow-lg shadow-slate-900/15 transition-all hover:-translate-y-0.5 hover:bg-white"
              >
                Start chatting now
              </UIButton>
              <UIButton
                as="a"
                href="mailto:hello@botme.ai"
                variant="ghost"
                size="lg"
                className="rounded-2xl px-6 py-3 font-semibold text-white hover:bg-white/10"
              >
                Talk to a specialist
              </UIButton>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>End-to-end encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>One-click data deletion</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Live onboarding support</span>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  )
}
