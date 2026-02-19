
import { useEffect, useState } from 'react'
import { Check, Trash2, Mic } from 'lucide-react'
import Modal from './ui/Modal'
import VoiceUpload from './VoiceUpload'
import api from '../api/axios'
import UIButton from './ui/Button'
import { useToast } from './ui/Toast'

export default function VoiceSettingsModal({ isOpen, onClose, selectedVoiceId, onVoiceSelect }) {
    const [voices, setVoices] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('list') // 'list' or 'upload'
    const { showSuccess, showError } = useToast()

    const fetchVoices = async () => {
        try {
            setLoading(true)
            const response = await api.getVoices()
            setVoices(response.data?.samples || [])
        } catch (error) {
            console.error('Failed to fetch voices:', error)
            showError('Failed to load voices')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchVoices()
        }
    }, [isOpen])

    const handleDelete = async (e, id) => {
        e.stopPropagation()
        if (!window.confirm('Are you sure? This action cannot be undone.')) return

        try {
            await api.deleteVoice(id)
            showSuccess('Voice deleted')
            setVoices(prev => prev.filter(v => v.id !== id))
            if (selectedVoiceId === id) {
                onVoiceSelect(null)
            }
        } catch (error) {
            showError('Failed to delete voice')
        }
    }

    const handleVoiceAdded = (newVoice) => {
        setVoices(prev => [...prev, newVoice])
        setActiveTab('list')
        onVoiceSelect(newVoice.id) // Auto-select new voice
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Voice Settings" maxWidth="max-w-xl">
            <div className="flex gap-2 mb-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <button
                    onClick={() => setActiveTab('list')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'list'
                            ? 'bg-white dark:bg-slate-700 shadow text-primary'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                        }`}
                >
                    My Voices
                </button>
                <button
                    onClick={() => setActiveTab('upload')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'upload'
                            ? 'bg-white dark:bg-slate-700 shadow text-primary'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                        }`}
                >
                    Clone New Voice
                </button>
            </div>

            <div className="min-h-[300px]">
                {activeTab === 'list' ? (
                    <div className="space-y-3">
                        {loading ? (
                            <div className="text-center py-10 text-slate-500">Loading voices...</div>
                        ) : voices.length === 0 ? (
                            <div className="text-center py-10 space-y-3">
                                <Mic className="w-12 h-12 mx-auto text-slate-300" />
                                <p className="text-slate-500">No voices cloned yet.</p>
                                <UIButton onClick={() => setActiveTab('upload')} variant="outline" size="sm">
                                    Clone your first voice
                                </UIButton>
                            </div>
                        ) : (
                            voices.map(voice => (
                                <div
                                    key={voice.id}
                                    onClick={() => onVoiceSelect(voice.id)}
                                    className={`
                                cursor-pointer flex items-center justify-between p-3 rounded-xl border transition-all
                                ${selectedVoiceId === voice.id
                                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                            : 'border-slate-200 hover:border-primary/50 dark:border-slate-700 dark:hover:border-slate-600'
                                        }
                            `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${selectedVoiceId === voice.id ? 'bg-primary/20 text-primary' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                                            <Mic className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{voice.persona_name}</p>
                                            <p className="text-xs text-slate-500">{new Date(voice.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {selectedVoiceId === voice.id && (
                                            <div className="flex items-center gap-1 text-xs font-medium text-primary px-2 py-1 bg-primary/10 rounded-full">
                                                <Check className="w-3 h-3" /> Active
                                            </div>
                                        )}
                                        <button
                                            onClick={(e) => handleDelete(e, voice.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <VoiceUpload onVoiceAdded={handleVoiceAdded} />
                )}
            </div>

            <div className="flex justify-end pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <UIButton variant="ghost" onClick={onClose}>Close</UIButton>
            </div>
        </Modal>
    )
}
