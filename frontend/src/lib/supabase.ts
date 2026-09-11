import { createClient } from '@supabase/supabase-js'

// These are the public browser credentials for the AURORA Supabase project.
// RLS is the security boundary. Never put service-role or provider secrets here.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kvgdpugqgtdxpxgyrvlz.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Mua9NoPXf-UKUABdpmUcRg_c7XJFStf'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
