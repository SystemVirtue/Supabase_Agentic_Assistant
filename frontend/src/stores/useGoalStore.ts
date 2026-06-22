import { create } from 'zustand'
import { getGoals, createGoal, updateGoal, deleteGoal, subscribeToGoals, type Goal } from '../services/goals'

interface GoalState {
  goals: Goal[]
  loading: boolean
  error: string | null
  fetchGoals: (userId?: string) => Promise<void>
  addGoal: (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateGoal: (goalId: string, updates: Partial<Goal>) => Promise<void>
  deleteGoal: (goalId: string) => Promise<void>
  subscribe: () => void
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  loading: false,
  error: null,

  fetchGoals: async (userId?: string) => {
    set({ loading: true, error: null })
    try {
      const goals = await getGoals(userId)
      set({ goals, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  addGoal: async (goal) => {
    set({ loading: true, error: null })
    try {
      const newGoal = await createGoal(goal)
      set((state) => ({ goals: [...state.goals, newGoal], loading: false }))
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  updateGoal: async (goalId, updates) => {
    set({ loading: true, error: null })
    try {
      const updatedGoal = await updateGoal(goalId, updates)
      set((state) => ({
        goals: state.goals.map((g) => (g.id === goalId ? updatedGoal : g)),
        loading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  deleteGoal: async (goalId) => {
    set({ loading: true, error: null })
    try {
      await deleteGoal(goalId)
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== goalId),
        loading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  subscribe: () => {
    const subscription = subscribeToGoals((payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload

      switch (eventType) {
        case 'INSERT':
          set((state) => ({ goals: [...state.goals, newRecord as Goal] }))
          break
        case 'UPDATE':
          set((state) => ({
            goals: state.goals.map((g) => (g.id === newRecord.id ? newRecord as Goal : g))
          }))
          break
        case 'DELETE':
          set((state) => ({
            goals: state.goals.filter((g) => g.id !== oldRecord.id)
          }))
          break
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }
}))
