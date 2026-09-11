import { supabase } from '../lib/supabase'

export type AuroraMode = 'fast' | 'balanced' | 'deep' | 'quorum'

export interface Workspace { id: string; name: string; created_at: string }
export interface Session { id: string; title: string | null; created_at: string; updated_at: string }
export interface Message { id: string; session_id: string; role: string; content: string; model?: string | null; provider?: string | null; created_at: string }
export interface Document { id: string; filename: string; mime_type?: string | null; content?: string | null; created_at: string }
export interface Run { id: string; question: string; mode: string; status: string; provider?: string | null; model?: string | null; latency_ms?: number | null; metadata: any; synthesis?: string | null; started_at: string; completed_at?: string | null }

async function requireUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Please sign in first.')
  return user
}

export async function bootstrapWorkspace(name = 'AURORA Workspace'): Promise<Workspace> {
  await requireUser()
  const { data, error } = await supabase.rpc('bootstrap_workspace', { p_name: name })
  if (error) throw error
  return data as Workspace
}

export async function getWorkspaces(): Promise<Workspace[]> {
  await requireUser()
  const { data, error } = await supabase.from('workspaces').select('id,name,created_at').order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function getSessions(workspaceId: string): Promise<Session[]> {
  const { data, error } = await supabase.from('sessions').select('id,title,created_at,updated_at').eq('workspace_id', workspaceId).order('updated_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createSession(workspaceId: string, title = 'New AURORA session'): Promise<Session> {
  const user = await requireUser()
  const { data, error } = await supabase.from('sessions').insert({ workspace_id: workspaceId, created_by: user.id, title }).select('id,title,created_at,updated_at').single()
  if (error) throw error
  return data
}

export async function getMessages(workspaceId: string, sessionId: string): Promise<Message[]> {
  const { data, error } = await supabase.from('messages').select('id,session_id,role,content,model,provider,created_at').eq('workspace_id', workspaceId).eq('session_id', sessionId).order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function getDocuments(workspaceId: string): Promise<Document[]> {
  const { data, error } = await supabase.from('documents').select('id,filename,mime_type,content,created_at').eq('workspace_id', workspaceId).order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function addDocument(workspaceId: string, filename: string, content: string, mimeType = 'text/plain') {
  const { error } = await supabase.from('documents').insert({ workspace_id: workspaceId, filename, mime_type: mimeType, content, metadata: { ingestion: 'manual-text', version: 1 } })
  if (error) throw error
}

export async function askAurora(workspaceId: string, sessionId: string | null, question: string, mode: AuroraMode) {
  const { data, error } = await supabase.functions.invoke('aurora-reason', { body: { workspace_id: workspaceId, session_id: sessionId, question, mode } })
  if (error) {
    let detail = error.message
    try { const body = await (error as any).context?.json?.(); if (body?.error) detail = body.error } catch {}
    throw new Error(detail)
  }
  if (!data?.answer) throw new Error('AURORA returned no answer.')
  return data
}

export async function getRuns(workspaceId: string): Promise<Run[]> {
  const { data, error } = await supabase.from('reasoning_runs').select('id,question,mode,status,provider,model,latency_ms,metadata,synthesis,started_at,completed_at').eq('workspace_id', workspaceId).order('started_at', { ascending: false }).limit(50)
  if (error) throw error
  return data ?? []
}

export async function getClaims(workspaceId: string) {
  const { data, error } = await supabase.from('claims').select('id,session_id,text,status,confidence,recorded_at').eq('workspace_id', workspaceId).order('recorded_at', { ascending: false }).limit(100)
  if (error) throw error
  return data ?? []
}

export async function signOut() { await supabase.auth.signOut() }
