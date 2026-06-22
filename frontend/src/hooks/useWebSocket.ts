import { useEffect, useRef } from 'react'
import ReconnectingWebSocket from 'reconnecting-websocket'
import { useConnectionStore } from '../stores/useConnectionStore'
import { useGoalStore } from '../stores/useGoalStore'
import { useAgentStore } from '../stores/useAgentStore'

const WS_URL = (import.meta as any).env.VITE_WS_URL || 'ws://localhost:8000/events'

export function useWebSocket() {
  const wsRef = useRef<ReconnectingWebSocket | null>(null)
  const { setStatus, incrementRetry, resetRetry, setLastConnected } = useConnectionStore()
  const { fetchGoals } = useGoalStore()
  const { fetchAgents } = useAgentStore()

  useEffect(() => {
    // Create WebSocket connection
    wsRef.current = new ReconnectingWebSocket(WS_URL, [], {
      debug: false,
    })

    const ws = wsRef.current

    ws.onopen = () => {
      console.log('WebSocket connected')
      setStatus('connected')
      resetRetry()
      setLastConnected(new Date().toISOString())
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      setStatus('disconnected')
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setStatus('disconnected')
      incrementRetry()
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('WebSocket message received:', data)

        // Handle different event types
        switch (data.type) {
          case 'goal.created':
          case 'goal.updated':
          case 'goal.completed':
          case 'goal.failed':
            fetchGoals()
            break

          case 'agent.registered':
          case 'agent.updated':
          case 'agent.heartbeat':
            fetchAgents()
            break

          case 'cognition.completed':
          case 'perception.observed':
          case 'governance.action':
            // Handle other event types as needed
            break

          default:
            console.log('Unknown event type:', data.type)
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [setStatus, incrementRetry, resetRetry, setLastConnected, fetchGoals, fetchAgents])

  return wsRef.current
}
