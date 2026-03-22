export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

export interface BackendMessage {
  id: string
  conversationId: string
  text: string | null
  sender: string | null
  createdAt: string
  updatedAt: string
}

export interface Conversation {
  id: string
  message: BackendMessage[] | null
  createdAt: string
  updatedAt: string
}
