import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import UICard from './ui/Card'
import UIButton from './ui/Button'
import { FileTextIcon, UploadCloudIcon } from './icons'

export default function UploadCard({ file, preview, onFileSelected, onAnalyze, busy, status }) {
  const [localError, setLocalError] = useState('')

  const handleFile = useCallback(
    async (inputFile) => {
      if (!inputFile) return
      if (!inputFile.name.endsWith('.txt')) {
        setLocalError('Please upload a .txt chat export file.')
        return
      }
      setLocalError('')
      onFileSelected?.(inputFile)
    },
    [onFileSelected]
  )

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault()
      const droppedFile = event.dataTransfer.files?.[0]
      handleFile(droppedFile)
    },
    [handleFile]
  )

  return (
    <UICard className="space-y-4">
      <div className="space-y-1">
        <p className="text-lg font-semibold text-slate-900 dark:text-white">Upload chat transcript</p>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          Accepted format: WhatsApp or Messenger export (.txt). We only read the first few lines to preview the file.
        </p>
      </div>

      <motion.label
        htmlFor="chat-upload"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 px-6 py-10 text-center transition hover:border-primary/60 hover:bg-primary/10"
      >
        <UploadCloudIcon className="h-8 w-8 text-primary" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Drag and drop your chat file</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">or click to browse from your device</p>
        </div>
        <input
          id="chat-upload"
          type="file"
          accept=".txt"
          onChange={(event) => handleFile(event.target.files?.[0])}
          hidden
        />
      </motion.label>

      {localError && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-500/10">{localError}</p>}

      {file && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-left shadow-inner dark:border-slate-700 dark:bg-slate-950/70">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-200">
            <FileTextIcon className="h-4 w-4 text-primary" aria-hidden="true" />
            {file.name}
          </div>
          <pre className="max-h-48 overflow-auto rounded-md bg-slate-900/90 p-3 text-xs text-slate-100 dark:bg-slate-900/80">
            {preview}
          </pre>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {status || 'Ready when you are. We’ll upload and analyse in one step.'}
        </div>
        <UIButton onClick={onAnalyze} disabled={!file || busy} className="px-6">
          {busy ? 'Processing…' : 'Analyse transcript'}
        </UIButton>
      </div>
    </UICard>
  )
}

