import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react'
import UICard from '../components/ui/Card'
import UIInputField from '../components/ui/InputField'
import UIButton from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { useToast } from '../components/ui/Toast'
import api from '../api/axios'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [busy, setBusy] = useState(false)
  const { showSuccess, showError } = useToast()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setBusy(true)
    try {
      await api.post('/api/contact', form)
      showSuccess('Thanks for reaching out! We will respond shortly.')
      setForm({ name: '', email: '', message: '' })
    } catch (error) {
      showError(error?.message || 'We could not send your message at the moment. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-10">
      <header className="space-y-4">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"
        >
          Contact Us
        </motion.h1>
        <p className="max-w-2xl text-slate-600 dark:text-slate-300">
          Questions about integrations, roadmap, or onboarding? Send us a note and our team will get back to you.
        </p>
        <Badge variant="info" size="sm">
          <Clock className="mr-1 h-3 w-3" />
          Average response time: 24 hours
        </Badge>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <UICard className="border-2 border-slate-200 dark:border-slate-800">
            <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">Send us a message</h2>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <UIInputField
                label="Full name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Jane Doe"
                required
              />
              <UIInputField
                label="Email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="you@example.com"
                required
              />
              <label className="block text-left">
                <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Message</span>
                <textarea
                  rows={6}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="How can we help?"
                  value={form.message}
                  onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                  required
                />
              </label>
              <UIButton type="submit" disabled={busy} loading={busy} size="lg" className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Send message
              </UIButton>
            </form>
          </UICard>
        </motion.div>

        {/* Contact Info Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <UICard>
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Get in touch</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary-100 p-2 dark:bg-primary-900/30">
                  <Mail className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Email</p>
                  <a
                    href="mailto:support@botme.ai"
                    className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  >
                    support@botme.ai
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-secondary-100 p-2 dark:bg-secondary-900/30">
                  <Mail className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Press & Media</p>
                  <a
                    href="mailto:press@botme.ai"
                    className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  >
                    press@botme.ai
                  </a>
                </div>
              </div>
            </div>
          </UICard>

          <UICard>
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Office Hours</h3>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Monday - Friday: 9:00 AM - 6:00 PM
              </p>
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Saturday - Sunday: Closed
              </p>
            </div>
          </UICard>

          <UICard className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-primary-200 dark:border-primary-800">
            <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">Follow us</h3>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
              Stay updated with the latest features and updates.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-primary-500 hover:text-primary-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                Twitter
              </a>
              <a
                href="#"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-primary-500 hover:text-primary-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                LinkedIn
              </a>
              <a
                href="#"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-primary-500 hover:text-primary-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                GitHub
              </a>
            </div>
          </UICard>
        </motion.div>
      </div>
    </section>
  )
}

