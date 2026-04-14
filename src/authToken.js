import { supabase, isSupabaseConfigured } from './supabase'

export async function getAuthToken() {
  if (!isSupabaseConfigured || !supabase) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || null
}
