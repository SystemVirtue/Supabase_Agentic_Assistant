import { create } from 'zustand'
import { getEntityState, getEntityHistory, searchEntities, type EntityState } from '../services/worldState'

interface WorldStateState {
  currentEntity: EntityState[] | null
  entityHistory: EntityState[] | null
  searchResults: { entity_id: string; attributes: string[] }[] | null
  loading: boolean
  error: string | null
  fetchEntityState: (entityId: string, timestamp?: string) => Promise<void>
  fetchEntityHistory: (entityId: string) => Promise<void>
  searchEntities: (query: string) => Promise<void>
  clearCurrentEntity: () => void
}

export const useWorldStateStore = create<WorldStateState>((set) => ({
  currentEntity: null,
  entityHistory: null,
  searchResults: null,
  loading: false,
  error: null,

  fetchEntityState: async (entityId, timestamp) => {
    set({ loading: true, error: null })
    try {
      const state = await getEntityState(entityId, timestamp)
      set({ currentEntity: state, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchEntityHistory: async (entityId) => {
    set({ loading: true, error: null })
    try {
      const history = await getEntityHistory(entityId)
      set({ entityHistory: history, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  searchEntities: async (query) => {
    set({ loading: true, error: null })
    try {
      const results = await searchEntities(query)
      set({ searchResults: results, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  clearCurrentEntity: () => {
    set({ currentEntity: null, entityHistory: null })
  }
}))
