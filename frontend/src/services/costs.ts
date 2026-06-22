import { supabase } from '../lib/supabase'

export interface CostTracking {
  id: string
  user_id: string
  date: string
  daily_cost_usd: number
  budget_usd: number
  tasks_completed: number
  metadata: Record<string, any>
  updated_at: string
}

export interface ReasoningOperation {
  id: string
  timestamp: string
  task: string
  complexity_class: string
  model_used: string
  tokens: number
  cost_usd: number
  goal_id?: string
}

export const getCostTracking = async (userId: string, startDate?: string, endDate?: string): Promise<CostTracking[]> => {
  let query = supabase.from('cost_tracking_cache').select('*').eq('user_id', userId)

  if (startDate) {
    query = query.gte('date', startDate)
  }
  if (endDate) {
    query = query.lte('date', endDate)
  }

  query = query.order('date', { ascending: false })

  const { data, error } = await query
  if (error) throw error
  return data as CostTracking[]
}

export const getTodayCost = async (userId: string): Promise<CostTracking | null> => {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('cost_tracking_cache')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // No rows returned
    throw error
  }
  return data as CostTracking
}

export const updateCostTracking = async (userId: string, costUsd: number, tasksCompleted: number): Promise<void> => {
  const today = new Date().toISOString().split('T')[0]

  const { error } = await supabase
    .from('cost_tracking_cache')
    .upsert({
      user_id: userId,
      date: today,
      daily_cost_usd: costUsd,
      tasks_completed: tasksCompleted,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,date'
    })

  if (error) throw error
}

export const getReasoningOperations = async (userId: string, limit: number = 50): Promise<ReasoningOperation[]> => {
  // This would call the cognitive engine's cost tracking API
  const COGNITIVE_ENGINE_URL = (import.meta as any).env.VITE_COGNITIVE_ENGINE_URL || 'http://localhost:8002'

  const response = await fetch(`${COGNITIVE_ENGINE_URL}/costs/operations?limit=${limit}&user_id=${userId}`)
  if (!response.ok) throw new Error('Failed to fetch reasoning operations')
  const data = await response.json()
  return data as ReasoningOperation[]
}

export const getCostByGoal = async (userId: string): Promise<{ goal_id: string; goal_title: string; total_cost: number; task_count: number }[]> => {
  // This would aggregate costs by goal from the cognitive engine
  const COGNITIVE_ENGINE_URL = (import.meta as any).env.VITE_COGNITIVE_ENGINE_URL || 'http://localhost:8002'

  const response = await fetch(`${COGNITIVE_ENGINE_URL}/costs/by-goal?user_id=${userId}`)
  if (!response.ok) throw new Error('Failed to fetch costs by goal')
  const data = await response.json()
  return data as { goal_id: string; goal_title: string; total_cost: number; task_count: number }[]
}
