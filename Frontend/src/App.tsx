import { useState, useEffect } from 'react'
import './App.css'

import { useChat } from './hooks/useChat'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { MessageList } from './components/MessageList'
import { ChatInput } from './components/ChatInput'
import type { ThemeId } from './themes'
import { applyTheme, loadSavedTheme } from './themes'

export default function App() {
  const { messages, isLoading, activeConversationId, sendMessage, loadConversation, newChat } = useChat()
  const [input, setInput] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [theme, setTheme] = useState<ThemeId>(() => {
    const saved = loadSavedTheme()
    applyTheme(saved)
    return saved
  })

  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(null), 4000)
    return () => clearTimeout(t)
  }, [error])

  const handleThemeChange = (id: ThemeId) => {
    applyTheme(id)
    setTheme(id)
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    try {
      await sendMessage(text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <div className="chat-app">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={loadConversation}
        onNewChat={newChat}
        activeId={activeConversationId}
      />

      <Header
        onOpenSidebar={() => setSidebarOpen(true)}
        onNewChat={newChat}
        newChatDisabled={messages.length === 0 && !isLoading}
        theme={theme}
        onThemeChange={handleThemeChange}
      />

      <MessageList
        messages={messages}
        onSuggestion={text => {
          setInput('')
          sendMessage(text).catch(err =>
            setError(err instanceof Error ? err.message : 'Something went wrong')
          )
        }}
      />

      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={isLoading}
      />

      {error && <div className="error-toast">{error}</div>}
    </div>
  )
}
