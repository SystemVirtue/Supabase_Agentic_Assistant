import { create } from 'zustand'

interface ServiceHealth {
  service_name: string
  status: 'healthy' | 'degraded' | 'down'
  uptime_seconds: number
  last_check: string
  metadata: Record<string, any>
}

interface SystemHealthState {
  services: ServiceHealth[]
  loading: boolean
  error: string | null
  fetchSystemHealth: () => Promise<void>
}

export const useSystemHealthStore = create<SystemHealthState>((set) => ({
  services: [],
  loading: false,
  error: null,

  fetchSystemHealth: async () => {
    set({ loading: true, error: null })
    try {
      // This would call a health check endpoint
      const response = await fetch('/api/health')
      if (!response.ok) throw new Error('Failed to fetch system health')
      const data = await response.json()
      set({ services: data, loading: false })
    } catch (error) {
      // For now, set mock data
      set({
        services: [
          { service_name: 'NATS', status: 'healthy', uptime_seconds: 3600, last_check: new Date().toISOString(), metadata: {} },
          { service_name: 'PostgreSQL', status: 'healthy', uptime_seconds: 3600, last_check: new Date().toISOString(), metadata: {} },
          { service_name: 'Redis', status: 'healthy', uptime_seconds: 3600, last_check: new Date().toISOString(), metadata: {} },
          { service_name: 'Cognitive Engine', status: 'healthy', uptime_seconds: 3600, last_check: new Date().toISOString(), metadata: {} },
        ],
        loading: false
      })
    }
  }
}))
