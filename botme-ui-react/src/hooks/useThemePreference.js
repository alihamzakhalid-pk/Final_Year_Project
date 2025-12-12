import { useEffect, useState } from 'react'

export default function useThemePreference() {
  const [mode, setMode] = useState('light')

  useEffect(() => {
    const stored = localStorage.getItem('theme-mode')
    if (stored === 'light' || stored === 'dark') {
      setMode(stored)
      // Apply immediately
      const root = document.documentElement
      if (stored === 'dark') {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
      return
    }
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialMode = prefersDark ? 'dark' : 'light'
    setMode(initialMode)
    const root = document.documentElement
    if (initialMode === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('theme-mode', mode)
    const root = document.documentElement
    if (mode === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [mode])

  return { mode, setMode }
}

