import { useState, useRef, useCallback } from 'react'
import type { Message, BackendMessage } from '../types'
import { CHAT_ENDPOINT, CONVERSATIONS_ENDPOINT } from '../constants'

function generateId() {
  return Math.random().toString(36).slice(2)
}

function mapBackendMessages(messages: BackendMessage[]): Message[] {
  return messages.map(m => ({
    id: String(m.id),
    role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
    content: m.text ?? '',
  }))
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const newChat = useCallback(() => {
    abortRef.current?.abort()
    setMessages([])
    setIsLoading(false)
    setActiveConversationId(null)
  }, [])

  const loadConversation = useCallback(async (id: number) => {
    abortRef.current?.abort()
    setMessages([])
    setIsLoading(true)
    try {
      const res = await fetch(`${CONVERSATIONS_ENDPOINT}/${id}`)
      if (!res.ok) throw new Error(`Server responded with ${res.status}`)
      const envelope = await res.json()
      const data = envelope.data
      setMessages(mapBackendMessages(data.message ?? []))
      setActiveConversationId(id)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return

    setIsLoading(true)

    const userMsg: Message = { id: generateId(), role: 'user', content: trimmed }
    const placeholderId = generateId()
    setMessages(prev => [
      ...prev,
      userMsg,
      { id: placeholderId, role: 'assistant', content: '', streaming: true },
    ])

    abortRef.current = new AbortController()

    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, conversationId: activeConversationId }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) throw new Error(`Server responded with ${response.status}`)

      const envelope = await response.json()
      const data = envelope.data
      setMessages(mapBackendMessages(data.message ?? []))
      setActiveConversationId(data.id)
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setMessages(prev => prev.filter(m => m.id !== userMsg.id && m.id !== placeholderId))
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, activeConversationId])

  return {
    messages,
    isLoading,
    activeConversationId,
    sendMessage,
    loadConversation,
    newChat,
  }
}
