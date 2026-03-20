import { MenuIcon } from './Icons'
import { ThemePicker } from './ThemePicker'
import type { ThemeId } from '../themes'

interface HeaderProps {
  onOpenSidebar: () => void
  onNewChat: () => void
  newChatDisabled: boolean
  theme: ThemeId
  onThemeChange: (id: ThemeId) => void
}

export function Header({ onOpenSidebar, onNewChat, newChatDisabled, theme, onThemeChange }: HeaderProps) {
  return (
    <header className="chat-header">
      <div className="header-left">
        <button className="icon-btn" onClick={onOpenSidebar} aria-label="Open sidebar">
          <MenuIcon />
        </button>
        <div className="header-avatar">M</div>
        <div className="header-info">
          <span className="header-name">Chat with Mathias</span>
          <span className="header-status">
            <span className="status-dot" />
            Ask me anything
          </span>
        </div>
      </div>

      <ThemePicker current={theme} onChange={onThemeChange} />

      <div className="header-right">
        <button className="ghost-btn" onClick={onNewChat} disabled={newChatDisabled}>
          New chat
        </button>
      </div>
    </header>
  )
}
