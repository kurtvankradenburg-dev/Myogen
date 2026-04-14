import { setCors } from './_lib/cors.js'
import { requireAuth } from './_lib/auth.js'
import { getUser, setUser, getMonthKey, FREE_ANALYSIS_LIMIT, isPermanentPremium } from './_lib/userStore.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const auth = await requireAuth(req, res)
  if (!auth) return

  const monthKey = getMonthKey()
  const userData = await getUser(auth.uid)
  const isPremium = userData.isPremium || isPermanentPremium(auth.email)

  if (!isPremium) {
    const count = userData.analysisUsage?.[monthKey] || 0
    if (count >= FREE_ANALYSIS_LIMIT) {
      return res.status(403).json({ error: 'Monthly analysis limit reached. Upgrade to Premium for unlimited analyses.' })
    }
    await setUser(auth.uid, {
      analysisUsage: { ...(userData.analysisUsage || {}), [monthKey]: count + 1 },
    })
  }

  res.json({ ok: true })
}
