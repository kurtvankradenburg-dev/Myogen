import { setCors } from './_lib/cors.js'
import { requireAuth } from './_lib/auth.js'
import { setUser } from './_lib/userStore.js'
import { verifyPayPalSubscription } from './_lib/paypal.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const auth = await requireAuth(req, res)
  if (!auth) return

  if (auth.isDemo) return res.status(400).json({ error: 'Cannot activate premium in demo mode' })

  const { subscriptionId } = req.body
  if (!subscriptionId) return res.status(400).json({ error: 'subscriptionId is required' })

  try {
    const subscription = await verifyPayPalSubscription(subscriptionId)
    if (subscription.status !== 'ACTIVE') {
      return res.status(400).json({ error: `Subscription is not active (status: ${subscription.status})` })
    }
    await setUser(auth.uid, {
      isPremium: true,
      email: auth.email,
      paypalSubscriptionId: subscriptionId,
      premiumActivatedAt: Date.now(),
    })
    res.json({ ok: true })
  } catch (err) {
    console.error('[activate-premium error]', err.message)
    res.status(500).json({ error: err.message })
  }
}
