import { useState, useRef, useCallback } from 'react'
import type { Message } from '../types'
import { CHAT_ENDPOINT, CONVERSATIONS_ENDPOINT } from '../constants'

function generateId() {
  return Math.random().toString(36).slice(2)
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const buildHistory = (msgs: Message[]) =>
    msgs.filter(m => !m.streaming).map(({ role, content }) => ({ role, content }))

  const newChat = useCallback(() => {
    abortRef.current?.abort()
    setMessages([])
    setIsLoading(false)
    setActiveConversationId(null)
  }, [])

  const loadConversation = useCallback(async (id: string) => {
    abortRef.current?.abort()
    setMessages([])
    setIsLoading(true)
    try {
      const res = await fetch(`${CONVERSATIONS_ENDPOINT}/${id}`)
      if (!res.ok) throw new Error(`Server responded with ${res.status}`)
      const data = await res.json()
      const msgs: Message[] = (data.messages ?? []).map((m: { role: string; content: string }) => ({
        id: generateId(),
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))
      setMessages(msgs)
      setActiveConversationId(id)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const sendMessage = useCallback(async (text: string, currentMessages: Message[]) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return

    setIsLoading(true)

    const userMsg: Message = { id: generateId(), role: 'user', content: trimmed }
    const assistantId = generateId()

    setMessages(prev => [
      ...prev,
      userMsg,
      { id: assistantId, role: 'assistant', content: '', streaming: true },
    ])

    abortRef.current = new AbortController()

    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...buildHistory(currentMessages), { role: 'user', content: trimmed }],
          conversationId: activeConversationId,
        }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) throw new Error(`Server responded with ${response.status}`)

      const contentType = response.headers.get('content-type') ?? ''

      if (contentType.includes('text/event-stream')) {
        const reader = response.body!.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let fullText = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data:')) continue
            const raw = line.slice(5).trim()
            if (raw === '[DONE]') break
            try {
              const parsed = JSON.parse(raw)
              const delta: string =
                parsed?.choices?.[0]?.delta?.content ??
                parsed?.delta?.text ??
                parsed?.text ??
                parsed?.content ??
                ''
              if (delta) {
                fullText += delta
                setMessages(prev =>
                  prev.map(m => m.id === assistantId ? { ...m, content: fullText } : m)
                )
              }
            } catch { /* skip malformed chunk */ }
          }
        }

        setMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, streaming: false } : m)
        )
      } else {
        const data = await response.json()
        const reply: string =
          data?.choices?.[0]?.message?.content ??
          data?.message?.content ??
          data?.content ??
          data?.reply ??
          data?.response ??
          '[No content in response]'

        if (data?.conversationId && !activeConversationId) {
          setActiveConversationId(data.conversationId)
        }

        setMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, content: reply, streaming: false } : m)
        )
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setMessages(prev => prev.filter(m => m.id !== assistantId && m.id !== userMsg.id))
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
