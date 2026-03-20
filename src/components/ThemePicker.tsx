import { useState, useRef, useEffect } from 'react'
import type { ThemeId } from '../themes'
import { THEMES } from '../themes'

interface ThemePickerProps {
  current: ThemeId
  onChange: (id: ThemeId) => void
}

export function ThemePicker({ current, onChange }: ThemePickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const currentTheme = THEMES.find(t => t.id === current)!

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="theme-picker" ref={ref}>
      <button
        className="theme-trigger"
        onClick={() => setOpen(o => !o)}
        aria-label="Change color theme"
      >
        <span className="theme-swatch" style={{ background: currentTheme.swatch }} />
        <span>{currentTheme.label}</span>
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}
        >
          <path d="M1.5 3.5L5 7L8.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="theme-dropdown">
          {THEMES.map(theme => (
            <button
              key={theme.id}
              className={`theme-option ${theme.id === current ? 'theme-option--active' : ''}`}
              onClick={() => { onChange(theme.id); setOpen(false) }}
            >
              <span className="theme-swatch" style={{ background: theme.swatch }} />
              {theme.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
