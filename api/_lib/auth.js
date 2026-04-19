import { createClient } from '@supabase/supabase-js'

function isSupabaseConfigured() {
  return !!process.env.VITE_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY
}

const supabase = isSupabaseConfigured()
  ? createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null

export async function requireAuth(req, res) {
  if (!isSupabaseConfigured()) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'demo'
    return { uid: ip, email: null, isDemo: true }
  }

  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' })
    return null
  }

  const token = header.slice(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' })
    return null
  }

  return { uid: user.id, email: user.email, isDemo: false }
}
