import { create } from 'zustand'
import { searchEpisodes, getEpisodesByEntity, getEpisodesByDateRange, type Episode, type SearchResult } from '../services/memory'

interface MemoryState {
  searchResults: SearchResult[] | null
  entityEpisodes: Episode[] | null
  dateRangeEpisodes: Episode[] | null
  loading: boolean
  error: string | null
  searchEpisodes: (query: string, limit?: number) => Promise<void>
  fetchEntityEpisodes: (entityId: string) => Promise<void>
  fetchDateRangeEpisodes: (startDate: string, endDate: string) => Promise<void>
  clearResults: () => void
}

export const useMemoryStore = create<MemoryState>((set) => ({
  searchResults: null,
  entityEpisodes: null,
  dateRangeEpisodes: null,
  loading: false,
  error: null,

  searchEpisodes: async (query, limit = 10) => {
    set({ loading: true, error: null })
    try {
      const results = await searchEpisodes(query, limit)
      set({ searchResults: results, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchEntityEpisodes: async (entityId) => {
    set({ loading: true, error: null })
    try {
      const episodes = await getEpisodesByEntity(entityId)
      set({ entityEpisodes: episodes, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchDateRangeEpisodes: async (startDate, endDate) => {
    set({ loading: true, error: null })
    try {
      const episodes = await getEpisodesByDateRange(startDate, endDate)
      set({ dateRangeEpisodes: episodes, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  clearResults: () => {
    set({ searchResults: null, entityEpisodes: null, dateRangeEpisodes: null })
  }
}))
