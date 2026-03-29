import { useState, useEffect } from 'react'
import type { Conversation } from '../types'
import { CONVERSATIONS_ENDPOINT } from '../constants'
import { formatDate } from '../utils/format'
import { CloseIcon, PlusIcon } from './Icons'
import { getSessionId } from '../utils/session'

interface SidebarProps {
  open: boolean
  onClose: () => void
  onSelect: (id: number) => void
  onNewChat: () => void
  activeId: number | null
}

export function Sidebar({ open, onClose, onSelect, onNewChat, activeId }: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setFetchError(false)
    fetch(`${CONVERSATIONS_ENDPOINT}?sessionId=${getSessionId()}`)
      .then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((envelope: { data: Conversation[] }) => setConversations([...envelope.data].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false))
  }, [open])

  return (
    <>
      <div
        className={`sidebar-backdrop ${open ? 'sidebar-backdrop--visible' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-title">Conversations</span>
          <button className="sidebar-close" onClick={onClose} aria-label="Close sidebar">
            <CloseIcon />
          </button>
        </div>

        <button className="sidebar-new-btn" onClick={() => { onNewChat(); onClose() }}>
          <PlusIcon /> New chat
        </button>

        <div className="sidebar-list">
          {loading && <div className="sidebar-empty">Loading...</div>}
          {!loading && fetchError && <div className="sidebar-empty">Failed to load conversations.</div>}
          {!loading && !fetchError && conversations.length === 0 && (
            <div className="sidebar-empty">No previous conversations.</div>
          )}
          {!loading && !fetchError && conversations.map(c => (
            <button
              key={c.id}
              className={`sidebar-item ${c.id === activeId ? 'sidebar-item--active' : ''}`}
              onClick={() => { onSelect(c.id); onClose() }}
            >
              <span className="sidebar-item-title">{c.message?.[0]?.text ?? c.id}</span>
              <span className="sidebar-item-date">{formatDate(c.updatedAt)}</span>
            </button>
          ))}
        </div>
      </aside>
    </>
  )
}
