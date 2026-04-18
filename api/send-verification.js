import { setCors } from './_lib/cors.js'

async function getAdminAuth() {
  if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) return null
  try {
    const { initializeApp, getApps, cert } = await import('firebase-admin/app')
    const { getAuth } = await import('firebase-admin/auth')
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: process.env.VITE_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      })
    }
    return getAuth()
  } catch (err) {
    console.error('[firebase-admin init error]', err.message)
    return null
  }
}

function verificationEmailHtml(link, year) {
  return `<!DOCTYPE html>
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
          <p style="margin:0 0 6px;font-size:18px;font-weight:700;color:#09090b;font-family:Arial,sans-serif">Verify your email</p>
          <p style="margin:0 0 36px;font-size:14px;color:#71717a;line-height:1.7;font-family:Arial,sans-serif">
            You're one step away from accessing your Myogen account.
            Click the button below to confirm your email address.
            This link expires in <strong style="color:#09090b">24 hours</strong>.
          </p>

          <!-- CTA Button -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 36px">
            <tr><td style="text-align:center">
              <a href="${link}"
                style="display:inline-block;background:#00F0FF;color:#050505;font-size:15px;font-weight:700;text-decoration:none;padding:16px 44px;border-radius:12px;font-family:Arial,sans-serif;letter-spacing:0.3px">
                Verify Now
              </a>
            </td></tr>
          </table>

          <p style="margin:0 0 6px;font-size:12px;color:#a1a1aa;font-family:Arial,sans-serif">Or paste this link into your browser:</p>
          <p style="margin:0 0 32px;font-size:11px;color:#71717a;word-break:break-all;font-family:'Courier New',monospace;line-height:1.6">${link}</p>

          <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.7;font-family:Arial,sans-serif">
            If you didn't create a Myogen account, you can safely ignore this email.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#fafafa;border-top:1px solid #f4f4f5;padding:24px 48px;text-align:center">
          <p style="margin:0;font-size:12px;color:#a1a1aa;font-family:Arial,sans-serif">
            &copy; ${year} Myogen &nbsp;&middot;&nbsp; Science-based training education
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email required' })

  const appUrl = process.env.VITE_APP_URL || 'https://myogen.com'
  const adminAuth = await getAdminAuth()

  if (adminAuth && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const link = await adminAuth.generateEmailVerificationLink(email, {
        url: `${appUrl}/?emailVerified=1`,
        handleCodeInApp: false,
      })

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
        subject: 'Verify your Myogen email',
        text: `Verify your Myogen account by visiting: ${link}\n\nThis link expires in 24 hours.\n\nIf you didn't create a Myogen account, ignore this email.`,
        html: verificationEmailHtml(link, new Date().getFullYear()),
      })

      return res.json({ ok: true, sent: true })
    } catch (err) {
      console.error('[send-verification error]', err.message)
    }
  }

  // Admin SDK or SMTP not configured — tell client to use Firebase's built-in sendEmailVerification
  res.json({ ok: true, useClientVerification: true })
}
