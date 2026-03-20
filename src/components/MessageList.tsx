import { useRef, useEffect } from 'react'
import type { Message } from '../types'
import { SUGGESTIONS } from '../constants'
import { renderMarkdown } from '../utils/markdown'

interface MessageListProps {
  messages: Message[]
  onSuggestion: (text: string) => void
}

function Markdown({ content }: { content: string }) {
  return (
    <div
      className="markdown"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  )
}

export function MessageList({ messages, onSuggestion }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <main className="messages-area">
      {messages.length === 0 ? (
        <div className="welcome">
          <div className="welcome-avatar">M</div>
          <h2>Hi, I'm Mathias</h2>
          <p>Ask me about my work, projects, background, or anything else you'd like to know.</p>
          <div className="suggestions">
            {SUGGESTIONS.map(s => (
              <button key={s} className="chip" onClick={() => onSuggestion(s)}>{s}</button>
            ))}
          </div>
        </div>
      ) : (
        messages.map(msg => (
          <div key={msg.id} className={`message message--${msg.role}`}>
            <div className="msg-avatar">
              {msg.role === 'assistant' ? 'M' : 'Y'}
            </div>
            <div className="bubble">
              {msg.role === 'assistant' ? (
                msg.streaming && msg.content === '' ? (
                  <div className="typing-dots"><span /><span /><span /></div>
                ) : (
                  <Markdown content={msg.content} />
                )
              ) : (
                <p className="user-text">{msg.content}</p>
              )}
            </div>
          </div>
        ))
      )}
      <div ref={endRef} />
    </main>
  )
}
