// World State Service - connects to the WSS API
const WSS_API_URL = (import.meta as any).env.VITE_WSS_API_URL || 'http://localhost:8001'

export interface EntityState {
  entity_id: string
  attribute: string
  value: any
  confidence: number
  source: string
  valid_from: string
  valid_until?: string
  state_type: 'belief' | 'fact'
}

export const getEntityState = async (entityId: string, timestamp?: string): Promise<EntityState[]> => {
  const url = timestamp
    ? `${WSS_API_URL}/state/${entityId}/at/${timestamp}`
    : `${WSS_API_URL}/state/${entityId}`

  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch entity state')
  const data = await response.json()
  return data as EntityState[]
}

export const getEntityHistory = async (entityId: string): Promise<EntityState[]> => {
  const response = await fetch(`${WSS_API_URL}/history/${entityId}`)
  if (!response.ok) throw new Error('Failed to fetch entity history')
  const data = await response.json()
  return data as EntityState[]
}

export const searchEntities = async (query: string): Promise<{ entity_id: string; attributes: string[] }[]> => {
  const response = await fetch(`${WSS_API_URL}/search?q=${encodeURIComponent(query)}`)
  if (!response.ok) throw new Error('Failed to search entities')
  const data = await response.json()
  return data as { entity_id: string; attributes: string[] }[]
}
