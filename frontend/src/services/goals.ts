import { supabase } from '../lib/supabase'

export interface Goal {
  id: string
  user_id: string
  title: string
  description?: string
  priority: number
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled' | 'blocked'
  parent_goal_id?: string
  desired_deadline?: string
  created_at: string
  updated_at: string
  completed_at?: string
}

export const getGoals = async (userId?: string) => {
  let query = supabase.from('goals').select('*').order('priority', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Goal[]
}

export const getGoal = async (goalId: string) => {
  const { data, error } = await supabase.from('goals').select('*').eq('id', goalId).single()
  if (error) throw error
  return data as Goal
}

export const createGoal = async (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase.from('goals').insert(goal).select().single()
  if (error) throw error
  return data as Goal
}

export const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
  const { data, error } = await supabase
    .from('goals')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', goalId)
    .select()
    .single()
  if (error) throw error
  return data as Goal
}

export const deleteGoal = async (goalId: string) => {
  const { error } = await supabase.from('goals').delete().eq('id', goalId)
  if (error) throw error
}

export const subscribeToGoals = (callback: (payload: any) => void) => {
  return supabase
    .channel('goals-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'goals' }, callback)
    .subscribe()
}
