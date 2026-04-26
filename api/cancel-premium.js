import { setCors } from './_lib/cors.js'
import { requireAuth } from './_lib/auth.js'
import { getUser, setUser, isPermanentPremium } from './_lib/userStore.js'
import { getPayPalAccessToken } from './_lib/paypal.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const auth = await requireAuth(req, res)
  if (!auth) return

  if (auth.isDemo) return res.status(400).json({ error: 'Cannot cancel in demo mode' })
  if (isPermanentPremium(auth.email)) return res.status(400).json({ error: 'Cannot cancel this account' })

  const userData = await getUser(auth.uid)
  if (!userData.isPremium) return res.status(400).json({ error: 'No active subscription found' })

  const subscriptionId = userData.paypalSubscriptionId
  if (!subscriptionId) {
    // No PayPal ID stored — just revoke premium access
    await setUser(auth.uid, { isPremium: false })
    return res.json({ ok: true, message: 'Premium access removed' })
  }

  try {
    const { token, base } = await getPayPalAccessToken()
    const cancelRes = await fetch(`${base}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason: 'Customer requested cancellation' }),
      signal: AbortSignal.timeout(10000),
    })

    // PayPal returns 204 No Content on success
    if (!cancelRes.ok && cancelRes.status !== 204) {
      const errBody = await cancelRes.text().catch(() => '')
      throw new Error(`PayPal cancel failed (${cancelRes.status}): ${errBody.slice(0, 120)}`)
    }

    await setUser(auth.uid, { isPremium: false })
    res.json({ ok: true })
  } catch (err) {
    console.error('[cancel-premium error]', err.message)
    res.status(500).json({ error: err.message })
  }
}
