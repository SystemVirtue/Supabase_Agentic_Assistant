import { supabase } from '../lib/supabase'

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_FUNCTION_URL

export interface Conversation {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model_used?: string
  tokens?: number
  cost_usd?: number
  created_at: string
}

export interface SendMessageResponse {
  user_message: Message
  assistant_message: Message
}

export const conversationsService = {
  async getConversations(): Promise<Conversation[]> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${GATEWAY_URL}/conversations`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch conversations')
    }

    const data = await response.json()
    return data.conversations || []
  },

  async createConversation(title?: string): Promise<Conversation> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${GATEWAY_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    })

    if (!response.ok) {
      throw new Error('Failed to create conversation')
    }

    const data = await response.json()
    return data.conversation
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${GATEWAY_URL}/conversations/${conversationId}/messages`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch messages')
    }

    return response.json()
  },

  async sendMessage(conversationId: string, content: string, model?: string): Promise<SendMessageResponse> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${GATEWAY_URL}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, model }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to send message')
    }

    return response.json()
  },
}
