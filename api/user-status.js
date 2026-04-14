import { setCors } from './_lib/cors.js'
import { requireAuth } from './_lib/auth.js'
import { getUser, getMonthKey, FREE_CHAT_LIMIT, FREE_ANALYSIS_LIMIT, isPermanentPremium } from './_lib/userStore.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const auth = await requireAuth(req, res)
  if (!auth) return

  const monthKey = getMonthKey()
  const userData = await getUser(auth.uid)
  const isPremium = userData.isPremium || isPermanentPremium(auth.email)

  res.json({
    isPremium,
    chatCount: userData.chatUsage?.[monthKey] || 0,
    analysisCount: userData.analysisUsage?.[monthKey] || 0,
    chatLimit: FREE_CHAT_LIMIT,
    analysisLimit: FREE_ANALYSIS_LIMIT,
  })
}
