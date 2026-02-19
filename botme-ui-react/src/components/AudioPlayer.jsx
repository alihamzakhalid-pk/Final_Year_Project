
import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Loader2, Volume2, VolumeX } from 'lucide-react'
import api from '../api/axios'

export default function AudioPlayer({ messageId, text, voiceId, autoplay = false }) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [audioUrl, setAudioUrl] = useState(null)
    const [error, setError] = useState(null)
    const audioRef = useRef(null)

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.src = ''
                audioRef.current = null
            }
        }
    }, [])

    const initializeAudio = () => {
        if (!audioRef.current) {
            audioRef.current = new Audio()
            audioRef.current.addEventListener('ended', () => setIsPlaying(false))
            audioRef.current.addEventListener('error', () => {
                setIsPlaying(false)
                setIsLoading(false)
                setError('Playback failed')
            })
        }
        return audioRef.current
    }

    const handlePlay = async () => {
        if (!text || !voiceId) {
            setError('Cannot play: missing text or voice')
            return
        }

        const audio = initializeAudio()

        if (isPlaying) {
            audio.pause()
            setIsPlaying(false)
            return
        }

        if (audioUrl) {
            try {
                await audio.play()
                setIsPlaying(true)
            } catch (e) {
                console.error("Playback error:", e)
                setError('Playback failed')
                setIsPlaying(false)
            }
            return
        }

        // Need to generate/fetch audio
        setIsLoading(true)
        setError(null)

        try {
            console.log(`[AudioPlayer] Requesting TTS for message ${messageId}...`)
            const response = await api.post('/api/tts/generate', {
                text: text,
                voice_sample_id: voiceId
            })
            console.log(`[AudioPlayer] TTS Response:`, response.data)

            if (response.data?.audio_url) {
                // Construct full URL if needed, but usually it's relative
                const url = response.data.audio_url
                console.log(`[AudioPlayer] Playing audio from: ${url}`)

                setAudioUrl(url)
                audio.src = url

                // Wait for audio to allow playing
                await new Promise((resolve, reject) => {
                    const onCanPlay = () => {
                        console.log(`[AudioPlayer] Audio can play through`)
                        audio.removeEventListener('canplaythrough', onCanPlay)
                        resolve()
                    }
                    const onError = (e) => {
                        console.error(`[AudioPlayer] Audio load error:`, e, audio.error)
                        reject(new Error(`Audio load failed: ${audio.error ? audio.error.message : 'Unknown error'}`))
                    }
                    audio.addEventListener('canplaythrough', onCanPlay)
                    audio.addEventListener('error', onError)

                    // Fallback if event doesn't fire immediately
                    setTimeout(() => {
                        if (audio.readyState >= 3) resolve()
                    }, 3000)
                })

                await audio.play()
                setIsPlaying(true)
            } else {
                throw new Error('No audio URL returned from API')
            }
        } catch (err) {
            console.error('TTS Playback Error:', err)
            setError('Failed to play')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center gap-2 mt-2">
            <button
                onClick={handlePlay}
                disabled={isLoading}
                className={`
            flex items-center justify-center w-8 h-8 rounded-full transition-colors
            ${isLoading
                        ? 'bg-slate-100 dark:bg-slate-800 cursor-wait'
                        : 'bg-primary/10 hover:bg-primary/20 text-primary dark:bg-primary-900/30 dark:hover:bg-primary-900/50 dark:text-primary-400'
                    }
        `}
                title="Play TTS"
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
            </button>

            {error && (
                <span className="text-xs text-red-500 animate-pulse">{error}</span>
            )}
        </div>
    )
}
