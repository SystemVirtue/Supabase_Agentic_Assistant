import { supabase } from '../lib/supabase'

export interface Conflict {
  id: string
  entity_id: string
  attribute: string
  competing_values: any[]
  severity: 'low' | 'medium' | 'high'
  blocked_goal_count: number
  created_at: string
  resolved: boolean
}

// Conflicts are derived from world state, so we query the world_state table
export const getConflicts = async () => {
  // Query world_state for entities with conflicting beliefs
  const { data, error } = await supabase
    .from('world_state')
    .select('*')
    .eq('state_type', 'belief')
    .order('valid_from', { ascending: false })

  if (error) throw error

  // Group by entity_id and attribute to find conflicts
  const conflicts: Record<string, any[]> = {}
  data.forEach((belief: any) => {
    const key = `${belief.entity_id}-${belief.attribute}`
    if (!conflicts[key]) conflicts[key] = []
    conflicts[key].push(belief)
  })

  // Filter for actual conflicts (different values for same entity/attribute)
  const actualConflicts = Object.entries(conflicts)
    .filter(([_, beliefs]) => {
      const values = beliefs.map((b: any) => b.value)
      return new Set(values).size > 1
    })
    .map(([key, beliefs]) => ({
      id: key,
      entity_id: key.split('-')[0],
      attribute: key.split('-')[1],
      competing_values: beliefs.map((b: any) => b.value),
      severity: 'medium' as const,
      blocked_goal_count: 0,
      created_at: beliefs[0].valid_from,
      resolved: false
    }))

  return actualConflicts as Conflict[]
}

export const resolveConflict = async (entityId: string, attribute: string, acceptedValue: any) => {
  // This would call the WSS API to resolve the conflict
  const WSS_API_URL = (import.meta as any).env.VITE_WSS_API_URL || 'http://localhost:8001'

  const response = await fetch(`${WSS_API_URL}/resolve-conflict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entity_id: entityId, attribute, acceptedValue })
  })

  if (!response.ok) throw new Error('Failed to resolve conflict')
  return response.json()
}
