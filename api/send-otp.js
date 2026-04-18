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
        subject: 'Your Myogen Verification Code',
        text: `Your Myogen verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, you can safely ignore this email.`,
        html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:48px 16px">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e4e7">

        <!-- Header -->
        <tr><td style="background:#050505;padding:36px 48px;text-align:center">
          <p style="margin:0;font-size:20px;font-weight:700;color:#00F0FF;letter-spacing:5px;font-family:Arial,sans-serif">MYOGEN</p>
          <p style="margin:8px 0 0;font-size:11px;color:#52525b;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif">Zero Bro-Science. Pure Biomechanics.</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:48px">
          <p style="margin:0 0 6px;font-size:18px;font-weight:700;color:#09090b;font-family:Arial,sans-serif">Identity Verification</p>
          <p style="margin:0 0 32px;font-size:14px;color:#71717a;line-height:1.7;font-family:Arial,sans-serif">
            We received a request to verify your identity on your Myogen account.
            Enter the code below — it expires in <strong style="color:#09090b">10 minutes</strong>.
          </p>

          <!-- Code box -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px">
            <tr><td style="background:#f4f4f5;border:1px solid #e4e4e7;border-radius:12px;padding:28px;text-align:center">
              <p style="margin:0 0 6px;font-size:11px;color:#a1a1aa;text-transform:uppercase;letter-spacing:3px;font-family:Arial,sans-serif">Verification Code</p>
              <p style="margin:0;font-size:40px;font-weight:700;color:#09090b;letter-spacing:10px;font-family:'Courier New',monospace">${code}</p>
            </td></tr>
          </table>

          <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.7;font-family:Arial,sans-serif">
            If you did not request this code, your account is safe — simply ignore this email.
            For help, reply to this message.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#fafafa;border-top:1px solid #f4f4f5;padding:24px 48px;text-align:center">
          <p style="margin:0;font-size:12px;color:#a1a1aa;font-family:Arial,sans-serif">
            © ${new Date().getFullYear()} Myogen &nbsp;·&nbsp; Science-based training education
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
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
