import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Pause, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../api/axios'

export default function VoiceNoteBubble({ audioUrl, text, voiceId, messageId, autoplay = false }) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [resolvedUrl, setResolvedUrl] = useState(audioUrl || null)
    const [duration, setDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [showTranscript, setShowTranscript] = useState(false)
    const [error, setError] = useState(null)
    const audioRef = useRef(null)
    const progressRef = useRef(null)
    const animFrameRef = useRef(null)

    // Generate audio if no audioUrl was provided
    useEffect(() => {
        if (!audioUrl && text && voiceId) {
            generateAudio()
        }
    }, [audioUrl, text, voiceId])

    // Autoplay once audio is ready
    useEffect(() => {
        if (autoplay && resolvedUrl && !isPlaying && !isLoading) {
            handlePlayPause()
        }
    }, [resolvedUrl, autoplay])

    // Cleanup
    useEffect(() => {
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.src = ''
                audioRef.current = null
            }
        }
    }, [])

    const generateAudio = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await api.post('/api/tts/generate', {
                text,
                voice_sample_id: voiceId
            })
            if (response.data?.audio_url) {
                setResolvedUrl(response.data.audio_url)
            } else {
                throw new Error('No audio URL returned')
            }
        } catch (err) {
            console.error('VoiceNoteBubble: TTS generation failed:', err)
            setError('Failed to generate voice')
        } finally {
            setIsLoading(false)
        }
    }

    const initAudio = useCallback(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio()
            audioRef.current.addEventListener('ended', () => {
                setIsPlaying(false)
                setCurrentTime(0)
                if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
            })
            audioRef.current.addEventListener('loadedmetadata', () => {
                setDuration(audioRef.current.duration)
            })
            audioRef.current.addEventListener('error', () => {
                setIsPlaying(false)
                setIsLoading(false)
                // Don't set error if we already have a resolved URL — the audio is likely fine
            })
        }
        return audioRef.current
    }, [])

    const updateProgress = useCallback(() => {
        if (audioRef.current && isPlaying) {
            setCurrentTime(audioRef.current.currentTime)
            animFrameRef.current = requestAnimationFrame(updateProgress)
        }
    }, [isPlaying])

    useEffect(() => {
        if (isPlaying) {
            animFrameRef.current = requestAnimationFrame(updateProgress)
        } else if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current)
        }
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
        }
    }, [isPlaying, updateProgress])

    const handlePlayPause = async () => {
        if (!resolvedUrl) {
            if (!isLoading) generateAudio()
            return
        }

        const audio = initAudio()

        if (isPlaying) {
            audio.pause()
            setIsPlaying(false)
            return
        }

        // Build the full URL for the audio
        const fullUrl = resolvedUrl.startsWith('http')
            ? resolvedUrl
            : `${window.location.origin}${resolvedUrl}`

        if (!audio.src || !audio.src.includes(resolvedUrl)) {
            audio.src = fullUrl
            setIsLoading(true)
            setError(null)
            try {
                await new Promise((resolve, reject) => {
                    const onCanPlay = () => {
                        audio.removeEventListener('canplaythrough', onCanPlay)
                        audio.removeEventListener('error', onError)
                        resolve()
                    }
                    const onError = () => {
                        audio.removeEventListener('canplaythrough', onCanPlay)
                        audio.removeEventListener('error', onError)
                        reject(new Error('Audio load failed'))
                    }
                    audio.addEventListener('canplaythrough', onCanPlay)
                    audio.addEventListener('error', onError)
                    // Fallback timeout
                    setTimeout(() => {
                        if (audio.readyState >= 3) resolve()
                    }, 5000)
                })
            } catch {
                setError('Failed to load audio')
                setIsLoading(false)
                return
            }
            setIsLoading(false)
        }

        try {
            await audio.play()
            setIsPlaying(true)
            setError(null)
        } catch {
            // Autoplay was blocked, clear error — user can click again
            setError(null)
        }
    }

    const handleSeek = (e) => {
        if (!audioRef.current || !duration) return
        const rect = progressRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const pct = Math.max(0, Math.min(1, x / rect.width))
        audioRef.current.currentTime = pct * duration
        setCurrentTime(pct * duration)
    }

    const formatTime = (secs) => {
        if (!secs || isNaN(secs)) return '0:00'
        const m = Math.floor(secs / 60)
        const s = Math.floor(secs % 60)
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0

    // Generate waveform bars (deterministic from messageId)
    const waveformBars = Array.from({ length: 28 }, (_, i) => {
        const seed = (messageId?.charCodeAt(i % (messageId?.length || 1)) || 42) + i * 7
        return 20 + (seed % 80)
    })

    return (
        <div className="w-full max-w-[340px]">
            {/* Voice Note Bubble — matches chat theme (white/light) */}
            <div className="flex items-center gap-3 rounded-2xl rounded-tl-sm bg-white border border-[#E5E7EB] px-4 py-3 shadow-md">
                {/* Play/Pause Button */}
                <button
                    onClick={handlePlayPause}
                    disabled={isLoading && !resolvedUrl}
                    className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-[#5B7FFF] hover:bg-[#4A6AD9] transition-all duration-200 shadow-sm"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : isPlaying ? (
                        <Pause className="w-5 h-5 text-white fill-white" />
                    ) : (
                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    )}
                </button>

                {/* Waveform + Progress */}
                <div className="flex-1 min-w-0">
                    {/* Waveform */}
                    <div
                        ref={progressRef}
                        onClick={handleSeek}
                        className="flex items-end gap-[2px] h-8 cursor-pointer"
                        role="slider"
                        aria-label="Audio progress"
                        aria-valuenow={Math.round(progress)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >
                        {waveformBars.map((height, i) => {
                            const barProgress = (i / waveformBars.length) * 100
                            const isActive = barProgress <= progress
                            return (
                                <motion.div
                                    key={i}
                                    className="flex-1 rounded-full transition-colors duration-150"
                                    style={{
                                        height: `${height}%`,
                                        minWidth: '3px',
                                        backgroundColor: isActive ? '#5B7FFF' : '#D1D5DB',
                                    }}
                                    animate={isPlaying && isActive ? {
                                        scaleY: [1, 1.15, 1],
                                    } : {}}
                                    transition={{
                                        duration: 0.4,
                                        repeat: Infinity,
                                        delay: i * 0.02,
                                    }}
                                />
                            )
                        })}
                    </div>

                    {/* Duration */}
                    <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-[#6B7280] font-medium">
                            {isPlaying || currentTime > 0 ? formatTime(currentTime) : formatTime(duration)}
                        </span>
                        {duration > 0 && (isPlaying || currentTime > 0) && (
                            <span className="text-[10px] text-[#6B7280] font-medium">
                                {formatTime(duration)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Error — only show for generation failures, not playback issues */}
            {error && error !== 'Playback blocked' && (
                <p className="mt-1 text-xs text-red-400 pl-2">{error}</p>
            )}

            {/* Show Transcript Toggle */}
            {text && (
                <button
                    onClick={() => setShowTranscript(!showTranscript)}
                    className="flex items-center gap-1 mt-1.5 ml-1 text-xs text-[#6B7280] hover:text-[#374151] transition-colors"
                >
                    {showTranscript ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {showTranscript ? 'Hide text' : 'Show text'}
                </button>
            )}
            {showTranscript && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-1 ml-1 px-3 py-2 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]"
                >
                    <p className="text-xs text-[#374151] leading-relaxed whitespace-pre-wrap">{text}</p>
                </motion.div>
            )}
        </div>
    )
}
