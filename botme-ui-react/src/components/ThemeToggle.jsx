import { useMemo } from 'react'
import useThemePreference from '../hooks/useThemePreference'
import { MoonIcon, SunIcon } from './icons'

export default function ThemeToggle() {
  const { mode, setMode } = useThemePreference()
  const isDark = useMemo(() => mode === 'dark', [mode])

  return (
    <button
      type="button"
      aria-label="Toggle color theme"
      onClick={() => setMode(isDark ? 'light' : 'dark')}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-slate-600 transition hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:text-slate-200"
    >
      <span className="sr-only">Toggle theme</span>
      {isDark ? <SunIcon className="h-5 w-5" aria-hidden="true" /> : <MoonIcon className="h-5 w-5" aria-hidden="true" />}
    </button>
  )
}

