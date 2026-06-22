import { create } from 'zustand'
import { getConflicts, resolveConflict, type Conflict } from '../services/conflicts'

interface ConflictState {
  conflicts: Conflict[]
  loading: boolean
  error: string | null
  fetchConflicts: () => Promise<void>
  resolveConflict: (entityId: string, attribute: string, acceptedValue: any) => Promise<void>
}

export const useConflictStore = create<ConflictState>((set) => ({
  conflicts: [],
  loading: false,
  error: null,

  fetchConflicts: async () => {
    set({ loading: true, error: null })
    try {
      const conflicts = await getConflicts()
      set({ conflicts, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  resolveConflict: async (entityId, attribute, acceptedValue) => {
    set({ loading: true, error: null })
    try {
      await resolveConflict(entityId, attribute, acceptedValue)
      // Refresh conflicts after resolution
      const conflicts = await getConflicts()
      set({ conflicts, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  }
}))
