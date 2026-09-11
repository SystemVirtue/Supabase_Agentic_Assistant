import { supabase } from '../lib/supabase'

export interface UserProfile {
  user_id: string
  display_name: string | null
  timezone: string | null
  default_model: string | null
  preferences: Record<string, unknown>
}

export interface UserCredential {
  id: string
  provider: string
  label: string
  secret_id: string | null
  metadata: Record<string, unknown>
  updated_at: string
}

async function currentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Please sign in first.')
  return user
}

export async function getProfile() {
  const user = await currentUser()
  const { data, error } = await supabase.from('user_profiles').select('user_id,display_name,timezone,default_model,preferences').eq('user_id', user.id).maybeSingle()
  if (error) throw error
  return (data ?? { user_id: user.id, display_name: user.user_metadata?.display_name ?? null, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, default_model: null, preferences: {} }) as UserProfile
}

export async function saveProfile(profile: Pick<UserProfile, 'display_name' | 'timezone' | 'default_model' | 'preferences'>) {
  const user = await currentUser()
  const { data, error } = await supabase.from('user_profiles').upsert({ user_id: user.id, ...profile, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).select('user_id,display_name,timezone,default_model,preferences').single()
  if (error) throw error
  return data as UserProfile
}

export async function getCredentials() {
  const user = await currentUser()
  const { data, error } = await supabase.from('user_credentials').select('id,provider,label,secret_id,metadata,updated_at').eq('user_id', user.id).order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as UserCredential[]
}

export async function registerCredential(provider: string, label: string, metadata: Record<string, unknown> = {}) {
  const user = await currentUser()
  const { data, error } = await supabase.from('user_credentials').insert({ user_id: user.id, provider, label, metadata }).select('id,provider,label,secret_id,metadata,updated_at').single()
  if (error) throw error
  return data as UserCredential
}

export async function deleteCredential(id: string) {
  await currentUser()
  const { error } = await supabase.from('user_credentials').delete().eq('id', id)
  if (error) throw error
}

export async function getAvailableModels() {
  const response = await fetch('https://openrouter.ai/api/v1/models', { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`OpenRouter model catalogue returned ${response.status}`)
  const payload = await response.json()
  const models = Array.isArray(payload?.data) ? payload.data : []
  return models
    .filter((m: any) => m?.id && m?.name)
    .map((m: any) => ({ id: String(m.id), name: String(m.name), context: Number(m.context_length || 0), free: Number(m?.pricing?.prompt || 0) === 0 && Number(m?.pricing?.completion || 0) === 0 }))
    .filter((m: any) => m.free)
    .sort((a: any, b: any) => a.name.localeCompare(b.name))
}
