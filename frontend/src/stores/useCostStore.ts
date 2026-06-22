import { create } from 'zustand'
import { 
  getCostTracking, 
  getTodayCost, 
  updateCostTracking, 
  getReasoningOperations, 
  getCostByGoal,
  type CostTracking,
  type ReasoningOperation
} from '../services/costs'

interface CostState {
  costHistory: CostTracking[]
  todayCost: CostTracking | null
  reasoningOperations: ReasoningOperation[] | null
  costByGoal: { goal_id: string; goal_title: string; total_cost: number; task_count: number }[] | null
  loading: boolean
  error: string | null
  fetchCostHistory: (userId: string, startDate?: string, endDate?: string) => Promise<void>
  fetchTodayCost: (userId: string) => Promise<void>
  fetchReasoningOperations: (userId: string, limit?: number) => Promise<void>
  fetchCostByGoal: (userId: string) => Promise<void>
  updateCost: (userId: string, costUsd: number, tasksCompleted: number) => Promise<void>
}

export const useCostStore = create<CostState>((set) => ({
  costHistory: [],
  todayCost: null,
  reasoningOperations: null,
  costByGoal: null,
  loading: false,
  error: null,

  fetchCostHistory: async (userId, startDate, endDate) => {
    set({ loading: true, error: null })
    try {
      const history = await getCostTracking(userId, startDate, endDate)
      set({ costHistory: history, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchTodayCost: async (userId) => {
    set({ loading: true, error: null })
    try {
      const todayCost = await getTodayCost(userId)
      set({ todayCost, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchReasoningOperations: async (userId, limit = 50) => {
    set({ loading: true, error: null })
    try {
      const operations = await getReasoningOperations(userId, limit)
      set({ reasoningOperations: operations, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchCostByGoal: async (userId) => {
    set({ loading: true, error: null })
    try {
      const costByGoal = await getCostByGoal(userId)
      set({ costByGoal, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  updateCost: async (userId, costUsd, tasksCompleted) => {
    try {
      await updateCostTracking(userId, costUsd, tasksCompleted)
      // Refresh today's cost
      const todayCost = await getTodayCost(userId)
      set({ todayCost })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  }
}))
