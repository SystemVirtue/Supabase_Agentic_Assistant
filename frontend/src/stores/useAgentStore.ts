import { create } from 'zustand'
import { getAgents, subscribeToAgents, type Agent } from '../services/agents'

interface AgentState {
  agents: Agent[]
  loading: boolean
  error: string | null
  fetchAgents: (activeOnly?: boolean) => Promise<void>
  subscribe: () => void
}

export const useAgentStore = create<AgentState>((set, get) => ({
  agents: [],
  loading: false,
  error: null,

  fetchAgents: async (activeOnly = true) => {
    set({ loading: true, error: null })
    try {
      const agents = await getAgents(activeOnly)
      set({ agents, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  subscribe: () => {
    const subscription = subscribeToAgents((payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload

      switch (eventType) {
        case 'INSERT':
          set((state) => ({ agents: [...state.agents, newRecord as Agent] }))
          break
        case 'UPDATE':
          set((state) => ({
            agents: state.agents.map((a) => (a.agent_id === newRecord.agent_id ? newRecord as Agent : a))
          }))
          break
        case 'DELETE':
          set((state) => ({
            agents: state.agents.filter((a) => a.agent_id !== oldRecord.agent_id)
          }))
          break
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }
}))
