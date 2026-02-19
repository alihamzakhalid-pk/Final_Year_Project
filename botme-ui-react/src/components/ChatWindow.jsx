import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Copy, MoreVertical, Check, MessageSquare } from 'lucide-react'
import UICard from './ui/Card'
import Avatar from './Avatar'
import Tooltip from './ui/Tooltip'
import { useToast } from './ui/Toast'
import AudioPlayer from './AudioPlayer'
import VoiceNoteBubble from './VoiceNoteBubble'

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

export default function ChatWindow({ messages = [], typing = false, personaName = '', selectedVoiceId = null, voiceMode = false }) {
  const scrollRef = useRef(null)
  const { showSuccess } = useToast()
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  const handleCopy = async (content, id) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      showSuccess('Message copied to clipboard')
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#F8FAFC] dark:bg-slate-900 transition-colors duration-300">
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
        aria-label="Conversation"
        aria-live="polite"
      >
        {messages.length === 0 && !typing && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-3">
              <MessageSquare className="h-12 w-12 text-[#9CA3AF] dark:text-slate-500 mx-auto" />
              <p className="text-base font-medium text-[#1F2937] dark:text-slate-100">No messages yet. Start the conversation!</p>
              <p className="text-sm text-[#6B7280] dark:text-slate-400">Type a message below to begin chatting with {personaName || 'AI'}</p>
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((message, index) => {
            const isUser = message.role === 'user'
            const showAvatar = !isUser && (index === 0 || messages[index - 1]?.role !== 'assistant')
            const isCopied = copiedId === message.id

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className={`group flex w-full gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {showAvatar && !isUser && (
                  <Avatar name={personaName || 'AI'} size={36} className="mt-1 flex-shrink-0 ring-2 ring-white shadow-md" />
                )}
                {isUser && <div className="w-9" />}
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  <div
                    className={`relative ${isUser
                      ? 'rounded-2xl rounded-tr-sm bg-gradient-to-br from-[#5B7FFF] to-[#7C3AED] text-white shadow-lg shadow-blue-500/20'
                      : message.isVoiceNote
                        ? 'bg-transparent'
                        : 'rounded-2xl rounded-tl-sm border border-[#E5E7EB] bg-white text-[#1F2937] shadow-md'
                      } ${message.isVoiceNote ? '' : 'px-4 py-3'} group-hover:shadow-lg transition-all duration-200`}
                  >
                    {/* Voice Note Bubble for voice messages */}
                    {!isUser && message.isVoiceNote && message.audioUrl ? (
                      <VoiceNoteBubble
                        audioUrl={message.audioUrl}
                        text={String(message.content || '')}
                        voiceId={selectedVoiceId}
                        messageId={message.id}
                        autoplay={true}
                      />
                    ) : (
                      <>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{String(message.content || '')}</p>
                      </>
                    )}

                    {/* Message Actions */}
                    <div className={`absolute ${isUser ? '-left-12' : '-right-12'} top-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                      <Tooltip content={isCopied ? 'Copied!' : 'Copy message'}>
                        <button
                          onClick={() => handleCopy(String(message.content || ''), message.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
                          aria-label="Copy message"
                        >
                          {isCopied ? (
                            <Check className="h-4 w-4 text-success-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                  <span className={`mt-1.5 text-xs text-[#9CA3AF] ${isUser ? 'text-right' : 'text-left'}`}>
                    {formatTime(message.timestamp || Date.now())}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {typing && (
          <motion.div
            key="typing-indicator"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <Avatar name={personaName || 'AI'} size={32} className="flex-shrink-0" />
            <div className={`flex items-center gap-2 rounded-2xl rounded-tl-[4px] border px-4 py-3 text-sm shadow-sm ${voiceMode
              ? 'border-[#DBEAFE] bg-[#EFF6FF] text-[#3B60D9]'
              : 'border-[#E5E7EB] bg-white text-[#6B7280]'
              }`}>
              <div className="flex gap-1">
                <span className={`h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s] ${voiceMode ? 'bg-[#5B7FFF]' : 'bg-[#6B7280]'}`} />
                <span className={`h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s] ${voiceMode ? 'bg-[#5B7FFF]' : 'bg-[#6B7280]'}`} />
                <span className={`h-2 w-2 animate-bounce rounded-full ${voiceMode ? 'bg-[#5B7FFF]' : 'bg-[#6B7280]'}`} />
              </div>
              <span className="ml-2">{voiceMode ? 'Recording voice...' : 'Typing...'}</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

