import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search, BookOpen, MessageCircle, Settings, User, HelpCircle } from 'lucide-react'
import UICard from '../components/ui/Card'
import SearchInput from '../components/ui/SearchInput'
import Tabs from '../components/ui/Tabs'
import Badge from '../components/ui/Badge'

const faqs = [
  {
    category: 'getting-started',
    q: 'How do I upload a chat file?',
    a: 'Navigate to the dashboard, drag-and-drop your .txt export into the upload card, and click "Analyse transcript". We will show progress for upload and analysis in real time. Supported formats include WhatsApp and Messenger plain-text exports.',
  },
  {
    category: 'upload',
    q: 'What file formats are supported?',
    a: 'Currently, we support plain-text (.txt) exports from WhatsApp and Messenger. The file should contain chat messages in a readable format. Custom parsers can be added by extending the backend `/api/upload` endpoint.',
  },
  {
    category: 'chat',
    q: 'How does persona selection work?',
    a: 'After uploading a chat, we analyze all participants and their message patterns. You can then select which person you want the AI to emulate. The AI will use that person\'s tone, vocabulary, and conversation style.',
  },
  {
    category: 'account',
    q: 'Can I reset my password?',
    a: 'A "Forgot password" link is included in the login form. Click it to initiate password recovery. You\'ll receive an email with instructions to reset your password.',
  },
  {
    category: 'getting-started',
    q: 'How many chats can I upload?',
    a: 'You can upload multiple chat transcripts. Each upload creates a separate conversation session. We recommend keeping files under 5MB for optimal performance.',
  },
  {
    category: 'chat',
    q: 'Can I export my conversations?',
    a: 'Yes! In the chat interface, click the "Export" button in the sidebar to download your conversation as a text file. This includes all messages from both you and the AI persona.',
  },
  {
    category: 'account',
    q: 'How are my tokens stored?',
    a: 'Authentication tokens are securely stored in your browser\'s localStorage and automatically attached to API requests. They expire after a period of inactivity for security.',
  },
  {
    category: 'upload',
    q: 'What if my file is too large?',
    a: 'Files larger than 5MB may take longer to process. We recommend splitting very large chats into smaller files or using the most recent messages. The system will show an error if the file exceeds size limits.',
  },
]

const categories = [
  { id: 'all', label: 'All', icon: HelpCircle },
  { id: 'getting-started', label: 'Getting Started', icon: BookOpen },
  { id: 'upload', label: 'Upload', icon: Settings },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'account', label: 'Account', icon: User },
]

export default function Help() {
  const [openItem, setOpenItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredFaqs = useMemo(() => {
    let filtered = faqs

    if (activeCategory !== 'all') {
      filtered = filtered.filter((faq) => faq.category === activeCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((faq) => faq.q.toLowerCase().includes(query) || faq.a.toLowerCase().includes(query))
    }

    return filtered
  }, [activeCategory, searchQuery])

  return (
    <section className="space-y-10">
      <header className="space-y-4">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"
        >
          Help & Support
        </motion.h1>
        <p className="max-w-2xl text-slate-600 dark:text-slate-300">
          Everything you need to know to onboard your transcripts, invite team members, and chat confidently with persona-aware responses.
        </p>
      </header>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search FAQs..."
          className="w-full max-w-2xl"
        />
      </motion.div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon
          const count = cat.id === 'all' ? faqs.length : faqs.filter((f) => f.category === cat.id).length
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeCategory === cat.id
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {cat.label}
              <Badge variant="default" size="sm" className="ml-1">
                {count}
              </Badge>
            </button>
          )
        })}
      </div>

      {/* Quick Help Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <UICard hover>
          <div className="mb-4 inline-flex rounded-lg bg-primary-100 p-3 dark:bg-primary-900/30">
            <BookOpen className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Getting Started</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-600" />
              Use the dashboard to upload chat transcripts (drag-and-drop supported)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-600" />
              Select a persona after analysis completes
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-600" />
              Start chatting with context-aware AI responses
            </li>
          </ul>
        </UICard>

        <UICard hover>
          <div className="mb-4 inline-flex rounded-lg bg-secondary-100 p-3 dark:bg-secondary-900/30">
            <MessageCircle className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Need More Help?</h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="mt-4 space-y-2">
            <a
              href="mailto:support@botme.ai"
              className="block text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              📧 support@botme.ai
            </a>
            <p className="text-xs text-slate-500 dark:text-slate-400">We typically reply within one business day</p>
          </div>
        </UICard>
      </div>

      {/* FAQs */}
      <div>
        <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
          Frequently Asked Questions
          {searchQuery && (
            <span className="ml-2 text-base font-normal text-slate-500">
              ({filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''})
            </span>
          )}
        </h2>
        <div className="space-y-3">
          <AnimatePresence>
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((item, index) => {
                const isOpen = item.q === openItem
                return (
                  <motion.div
                    key={item.q}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <UICard className="p-0 overflow-hidden">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
                        onClick={() => setOpenItem(isOpen ? null : item.q)}
                        aria-expanded={isOpen}
                      >
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.q}</span>
                        <ChevronDown
                          className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-primary-600' : ''}`}
                        />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-slate-200 px-6 py-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
                              {item.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </UICard>
                  </motion.div>
                )
              })
            ) : (
              <UICard>
                <p className="text-center text-slate-500 dark:text-slate-400">No FAQs found matching your search.</p>
              </UICard>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

