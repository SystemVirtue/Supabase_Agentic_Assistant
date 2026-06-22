import { supabase } from '../lib/supabase'

export interface Agent {
  agent_id: string
  agent_name: string
  agent_type: string
  capabilities: string[]
  trust_score: number
  current_load: number
  max_capacity: number
  active: boolean
  last_heartbeat: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export const getAgents = async (activeOnly: boolean = true) => {
  let query = supabase.from('agents').select('*').order('trust_score', { ascending: false })
  
  if (activeOnly) {
    query = query.eq('active', true)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data as Agent[]
}

export const getAgent = async (agentId: string) => {
  const { data, error } = await supabase.from('agents').select('*').eq('agent_id', agentId).single()
  if (error) throw error
  return data as Agent
}

export const updateAgentHeartbeat = async (agentId: string) => {
  const { error } = await supabase
    .from('agents')
    .update({ last_heartbeat: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('agent_id', agentId)
  if (error) throw error
}

export const subscribeToAgents = (callback: (payload: any) => void) => {
  return supabase
    .channel('agents-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, callback)
    .subscribe()
}
