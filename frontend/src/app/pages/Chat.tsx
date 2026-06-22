import { useState, useEffect, useRef } from 'react'
import { conversationsService, Conversation, Message } from '../../services/conversations'

export default function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      const data = await conversationsService.getConversations()
      setConversations(data)
      if (data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0])
        loadMessages(data[0].id)
      }
    } catch (err) {
      setError('Failed to load conversations')
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const data = await conversationsService.getMessages(conversationId)
      setMessages(data)
    } catch (err) {
      setError('Failed to load messages')
    }
  }

  const createNewConversation = async () => {
    try {
      const newConv = await conversationsService.createConversation('New Chat')
      setConversations([newConv, ...conversations])
      setSelectedConversation(newConv)
      setMessages([])
    } catch (err) {
      setError('Failed to create conversation')
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedConversation || loading) return

    setLoading(true)
    setError(null)

    try {
      const response = await conversationsService.sendMessage(
        selectedConversation.id,
        inputMessage,
        undefined // Use default model
      )

      setMessages([...messages, response.user_message, response.assistant_message])
      setInputMessage('')
    } catch (err: any) {
      setError(err.message || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex h-screen bg-[var(--dca-bg-primary)]">
      {/* Sidebar */}
      <div className="w-64 bg-[var(--dca-bg-secondary)] border-r border-[var(--dca-bg-tertiary)] flex flex-col">
        <div className="p-4 border-b border-[var(--dca-bg-tertiary)]">
          <button
            onClick={createNewConversation}
            className="w-full px-4 py-2 bg-[var(--dca-accent-primary)] text-white rounded-md hover:opacity-90"
          >
            + New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => {
                setSelectedConversation(conv)
                loadMessages(conv.id)
              }}
              className={`p-4 cursor-pointer hover:bg-[var(--dca-bg-tertiary)] ${
                selectedConversation?.id === conv.id ? 'bg-[var(--dca-bg-tertiary)]' : ''
              }`}
            >
              <div className="text-sm text-[var(--dca-text-primary)] truncate">{conv.title}</div>
              <div className="text-xs text-[var(--dca-text-tertiary)] mt-1">
                {new Date(conv.updated_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-md text-red-500">
              {error}
            </div>
          )}
          
          {!selectedConversation && (
            <div className="text-center text-[var(--dca-text-secondary)] mt-20">
              <p>Select a conversation or create a new one to start chatting</p>
            </div>
          )}

          {selectedConversation && messages.length === 0 && (
            <div className="text-center text-[var(--dca-text-secondary)] mt-20">
              <p>Start a conversation by sending a message</p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-4 ${
                msg.role === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block max-w-[70%] p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-[var(--dca-accent-primary)] text-white'
                    : 'bg-[var(--dca-bg-secondary)] text-[var(--dca-text-primary)]'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                {msg.model_used && (
                  <div className="text-xs mt-1 opacity-70">
                    {msg.model_used} • {msg.tokens || 0} tokens • ${(msg.cost_usd || 0).toFixed(6)}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-center text-[var(--dca-text-secondary)]">
              <div className="inline-block animate-pulse">Thinking...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {selectedConversation && (
          <div className="p-4 border-t border-[var(--dca-bg-tertiary)]">
            <div className="flex gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Press Enter to send)"
                className="flex-1 p-3 bg-[var(--dca-bg-secondary)] text-[var(--dca-text-primary)] rounded-md border border-[var(--dca-bg-tertiary)] focus:outline-none focus:border-[var(--dca-accent-primary)] resize-none"
                rows={2}
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !inputMessage.trim()}
                className="px-6 py-2 bg-[var(--dca-accent-primary)] text-white rounded-md hover:opacity-90 disabled:opacity-50"
              >
                Send
              </button>
            </div>
            <div className="text-xs text-[var(--dca-text-tertiary)] mt-2">
              Using FREE models by default. Configure model preferences in settings.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
