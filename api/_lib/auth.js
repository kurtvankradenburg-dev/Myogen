import { createClient } from '@supabase/supabase-js'

function isSupabaseConfigured() {
  return !!process.env.VITE_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY
}

const supabase = isSupabaseConfigured()
  ? createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null

// Decode a JWT payload without signature verification (works for Firebase JWTs)
function decodeJwtPayload(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'))
    if (payload.exp && payload.exp < Date.now() / 1000) return null // expired
    return payload
  } catch { return null }
}

export async function requireAuth(req, res) {
  const header = req.headers.authorization

  // No token — unauthenticated demo mode (IP-based)
  if (!header?.startsWith('Bearer ')) {
    if (!isSupabaseConfigured()) {
      const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'demo'
      return { uid: ip, email: null, isDemo: true }
    }
    res.status(401).json({ error: 'Authentication required. Please sign in.' })
    return null
  }

  const token = header.slice(7)

  // Try Supabase verification first if configured
  if (isSupabaseConfigured()) {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (!error && user) return { uid: user.id, email: user.email, isDemo: false }
  }

  // Fall back to decoding as a Firebase JWT (no signature verification)
  const payload = decodeJwtPayload(token)
  if (payload && (payload.sub || payload.user_id)) {
    return {
      uid: payload.sub || payload.user_id,
      email: payload.email || null,
      isDemo: false,
    }
  }

  res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' })
  return null
}
