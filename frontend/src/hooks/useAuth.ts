import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch(() => mounted && setLoading(false))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !password) throw new Error('Email and password are required.')
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password })
    if (error) throw error
    return data
  }

  const signUp = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !password) throw new Error('Email and password are required.')
    if (password.length < 8) throw new Error('Password must be at least 8 characters.')

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return { user, session, loading, signIn, signUp, signOut }
}
