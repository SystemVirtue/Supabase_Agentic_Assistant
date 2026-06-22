import { create } from 'zustand'

type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected'

interface ConnectionState {
  status: ConnectionStatus
  retryCount: number
  lastConnected: string | null
  setStatus: (status: ConnectionStatus) => void
  incrementRetry: () => void
  resetRetry: () => void
  setLastConnected: (timestamp: string) => void
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  status: 'disconnected',
  retryCount: 0,
  lastConnected: null,

  setStatus: (status) => set({ status }),
  
  incrementRetry: () => set((state) => ({ retryCount: state.retryCount + 1 })),
  
  resetRetry: () => set({ retryCount: 0 }),
  
  setLastConnected: (timestamp) => set({ lastConnected: timestamp })
}))
