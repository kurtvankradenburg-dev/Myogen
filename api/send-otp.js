import { setCors } from './_lib/cors.js'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email required' })

  const code = String(Math.floor(100000 + Math.random() * 900000))
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  await supabase
    .from('otps')
    .upsert({ email: email.toLowerCase(), code, expires_at: expiresAt }, { onConflict: 'email' })

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const nodemailer = await import('nodemailer')
      const transporter = nodemailer.default.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      })
      await transporter.sendMail({
        from: `"Myogen" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Myogen — Verification Code',
        text: `Your Myogen verification code is: ${code}\n\nThis code expires in 10 minutes.`,
        html: `<p>Your Myogen verification code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`,
      })
      res.json({ ok: true, sent: true })
    } catch (err) {
      console.error('[OTP email error]', err.message)
      res.json({ ok: true, sent: false, devCode: code })
    }
  } else {
    console.log(`\n  [OTP for ${email}] → ${code}\n`)
    res.json({ ok: true, sent: false, devCode: code })
  }
}
