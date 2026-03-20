export type ThemeId = 'light' | 'dark' | 'blue' | 'pink' | 'green' | 'orange' | 'purple'

export interface Theme {
  id: ThemeId
  label: string
  swatch: string
}

export const THEMES: Theme[] = [
  { id: 'light',  label: 'Light',  swatch: '#f5f5f4' },
  { id: 'dark',   label: 'Dark',   swatch: '#1e1e1e' },
  { id: 'blue',   label: 'Blue',   swatch: '#4a9fd4' },
  { id: 'pink',   label: 'Pink',   swatch: '#e879a0' },
  { id: 'green',  label: 'Green',  swatch: '#3aab6d' },
  { id: 'orange', label: 'Orange', swatch: '#d97706' },
  { id: 'purple', label: 'Purple', swatch: '#8b5cf6' },
]

export function applyTheme(id: ThemeId) {
  document.documentElement.setAttribute('data-theme', id)
  localStorage.setItem('theme', id)
}

export function loadSavedTheme(): ThemeId {
  return (localStorage.getItem('theme') as ThemeId | null) ?? 'blue'
}
