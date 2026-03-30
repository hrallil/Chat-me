export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export const CHAT_ENDPOINT          = `${API_BASE}/api/chat`
export const CONVERSATIONS_ENDPOINT = `${API_BASE}/api/conversations`

export const SUGGESTIONS = [
  'What do you work on?',
  "What's your background?",
  'What are your skills?',
  'What are you passionate about?',
]
