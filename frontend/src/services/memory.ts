import { supabase } from '../lib/supabase'

export interface Episode {
  id: string
  entity_id: string
  content: string
  timestamp: string
  embedding: number[]
  metadata: Record<string, any>
}

export interface SearchResult {
  id: string
  content: string
  similarity: number
  entity_id: string
  timestamp: string
}

export const searchEpisodes = async (query: string, limit: number = 10): Promise<SearchResult[]> => {
  // This would call the cognitive engine's memory search API
  const COGNITIVE_ENGINE_URL = (import.meta as any).env.VITE_COGNITIVE_ENGINE_URL || 'http://localhost:8002'
  
  const response = await fetch(`${COGNITIVE_ENGINE_URL}/memory/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, limit })
  })
  
  if (!response.ok) throw new Error('Failed to search memory')
  const data = await response.json()
  return data as SearchResult[]
}

export const getEpisodesByEntity = async (entityId: string): Promise<Episode[]> => {
  const { data, error } = await supabase
    .from('episodes')
    .select('*')
    .eq('entity_id', entityId)
    .order('timestamp', { ascending: false })
  
  if (error) throw error
  return data as Episode[]
}

export const getEpisodesByDateRange = async (startDate: string, endDate: string): Promise<Episode[]> => {
  const { data, error } = await supabase
    .from('episodes')
    .select('*')
    .gte('timestamp', startDate)
    .lte('timestamp', endDate)
    .order('timestamp', { ascending: false })
  
  if (error) throw error
  return data as Episode[]
}
