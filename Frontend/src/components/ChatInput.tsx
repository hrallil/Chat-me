import { useRef, useEffect } from 'react'
import { SendIcon } from './Icons'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled: boolean
}

export function ChatInput({ value, onChange, onSend, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <footer className="input-area">
      <div className={`input-wrapper ${disabled ? 'input-wrapper--busy' : ''}`}>
        <textarea
          ref={textareaRef}
          className="chat-input"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask something..."
          rows={1}
          disabled={disabled}
        />
        <button
          className="send-btn"
          onClick={onSend}
          disabled={!value.trim() || disabled}
          aria-label="Send"
        >
          <SendIcon />
        </button>
      </div>
      <p className="input-hint">
        <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for newline
      </p>
    </footer>
  )
}
