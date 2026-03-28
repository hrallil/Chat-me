export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

export interface BackendMessage {
  id: number
  conversationId: number
  text: string | null
  sender: string | null
  createdAt: string
  updatedAt: string
}

export interface Conversation {
  id: number
  message: BackendMessage[] | null
  createdAt: string
  updatedAt: string
}
