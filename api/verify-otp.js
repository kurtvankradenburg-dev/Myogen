import { setCors } from './_lib/cors.js'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { email, code } = req.body
  if (!email || !code) return res.status(400).json({ error: 'Email and code required' })

  const { data: stored } = await supabase
    .from('otps')
    .select('*')
    .eq('email', email.toLowerCase())
    .single()

  if (!stored) return res.status(400).json({ error: 'No OTP found for this email' })

  if (new Date() > new Date(stored.expires_at)) {
    await supabase.from('otps').delete().eq('email', email.toLowerCase())
    return res.status(400).json({ error: 'Code expired' })
  }

  if (stored.code !== String(code)) return res.status(400).json({ error: 'Invalid code' })

  await supabase.from('otps').delete().eq('email', email.toLowerCase())
  res.json({ ok: true })
}
