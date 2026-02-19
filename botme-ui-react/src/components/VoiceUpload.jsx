
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, UploadCloud, X, Play, Loader2, Music } from 'lucide-react'
import { useToast } from './ui/Toast'
import api from '../api/axios'
import UIButton from './ui/Button'
import UICard from './ui/Card'
import ProgressBar from './ui/ProgressBar'

export default function VoiceUpload({ onVoiceAdded }) {
    const [file, setFile] = useState(null)
    const [personaName, setPersonaName] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const fileInputRef = useRef(null)
    const { showSuccess, showError } = useToast()

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
                showError('File size too large (max 10MB)')
                return
            }
            setFile(selectedFile)
        }
    }

    const handleUpload = async () => {
        if (!file || !personaName.trim()) {
            showError('Please select a file and enter a persona name')
            return
        }

        setIsUploading(true)
        setUploadProgress(10) // Start progress

        const formData = new FormData()
        formData.append('file', file)
        formData.append('persona_name', personaName)

        try {
            // Simulate progress for better UX
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 5, 90))
            }, 500)

            const response = await api.uploadVoice(formData)

            clearInterval(progressInterval)
            setUploadProgress(100)

            showSuccess('Voice cloned successfully!')
            setFile(null)
            setPersonaName('')
            if (onVoiceAdded && response.data?.voice_sample) {
                onVoiceAdded(response.data.voice_sample)
            }
        } catch (error) {
            console.error('Upload failed:', error)
            showError(error.response?.data?.error || 'Failed to upload voice')
            setUploadProgress(0)
        } finally {
            setIsUploading(false)
            setTimeout(() => setUploadProgress(0), 1000)
        }
    }

    return (
        <UICard className="p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Mic className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Clone a Voice</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Upload a 1-5 min audio sample (mp3, wav) to clone.</p>
                </div>
            </div>

            <div className="space-y-3">
                {/* Name Input */}
                <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Persona Voice Name
                    </label>
                    <input
                        type="text"
                        value={personaName}
                        onChange={(e) => setPersonaName(e.target.value)}
                        placeholder="e.g. Iron Man, Friendly Assistant"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        disabled={isUploading}
                    />
                </div>

                {/* File Upload Area */}
                <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={`
                relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer
                ${file
                            ? 'border-primary/50 bg-primary/5'
                            : 'border-slate-200 hover:border-primary/40 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900'
                        }
            `}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="audio/*"
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />

                    {file ? (
                        <div className="flex items-center gap-3 text-primary">
                            <Music className="w-6 h-6" />
                            <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                className="p-1 hover:bg-red-100 rounded-full text-red-500 ml-2"
                                disabled={isUploading}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Click to upload audio</p>
                            <p className="text-xs text-slate-400">MP3, WAV, M4A up to 10MB</p>
                        </>
                    )}

                    {/* Progress Overlay */}
                    {isUploading && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 flex flex-col items-center justify-center rounded-xl z-10 backdrop-blur-sm">
                            <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Cloning Voice...</span>
                            <div className="w-2/3 mt-2">
                                <ProgressBar value={uploadProgress} showLabel={false} height="h-1.5" />
                            </div>
                        </div>
                    )}
                </div>

                <UIButton
                    onClick={handleUpload}
                    disabled={!file || !personaName || isUploading}
                    className="w-full"
                >
                    {isUploading ? 'Cloning...' : 'Start Voice Cloning'}
                </UIButton>
            </div>
        </UICard>
    )
}
