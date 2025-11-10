import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, X } from 'lucide-react'
import ProgressBar from './ProgressBar'

export default function FileUpload({
  onFileSelect,
  accept = '.txt',
  maxSize = 5 * 1024 * 1024, // 5MB
  className = '',
  disabled = false,
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')

  const validateFile = (file) => {
    if (!file.name.endsWith(accept.replace('.', ''))) {
      setError(`Please upload a ${accept} file`)
      return false
    }
    if (file.size > maxSize) {
      setError(`File size must be less than ${(maxSize / 1024 / 1024).toFixed(0)}MB`)
      return false
    }
    setError('')
    return true
  }

  const handleFile = useCallback(
    (file) => {
      if (!file) return
      if (validateFile(file)) {
        setSelectedFile(file)
        onFileSelect?.(file)
      }
    },
    [accept, maxSize, onFileSelect]
  )

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = (e) => {
    const file = e.target.files?.[0]
    handleFile(file)
  }

  const handleRemove = () => {
    setSelectedFile(null)
    setUploadProgress(0)
    setError('')
    onFileSelect?.(null)
  }

  return (
    <div className={className}>
      {!selectedFile ? (
        <motion.label
          htmlFor="file-upload"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          whileHover={{ scale: disabled ? 1 : 1.01 }}
          whileTap={{ scale: disabled ? 1 : 0.99 }}
          className={`
            flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 text-center transition-all
            ${
              isDragging
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10'}
          `}
        >
          <Upload
            className={`h-12 w-12 ${isDragging ? 'text-primary-600' : 'text-slate-400'}`}
          />
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {isDragging ? 'Drop file here' : 'Drag and drop your file'}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              or click to browse
            </p>
          </div>
          <input
            id="file-upload"
            type="file"
            accept={accept}
            onChange={handleInputChange}
            disabled={disabled}
            className="hidden"
          />
        </motion.label>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary-100 dark:bg-primary-900/30 p-2">
                <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
              aria-label="Remove file"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {uploadProgress > 0 && (
            <div className="mt-3">
              <ProgressBar value={uploadProgress} showLabel={false} />
            </div>
          )}
        </motion.div>
      )}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-error-600 dark:text-error-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

