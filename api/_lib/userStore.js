import { createClient } from '@supabase/supabase-js'

const supabase = process.env.VITE_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null

export const PERMANENT_PREMIUM_EMAIL = 'kurtvankradenburg@gmail.com'
export const FREE_CHAT_LIMIT = 15
export const FREE_ANALYSIS_LIMIT = 1

export function getMonthKey() {
  const now = new Date()
  return `${now.getFullYear()}-${now.getMonth() + 1}`
}

export async function getUser(uid) {
  if (!supabase) return { isPremium: false, chatUsage: {}, analysisUsage: {} }

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', uid)
    .single()

  if (!data) return { isPremium: false, chatUsage: {}, analysisUsage: {} }

  return {
    isPremium: data.is_premium,
    chatUsage: data.chat_usage || {},
    analysisUsage: data.analysis_usage || {},
    email: data.email,
    paypalSubscriptionId: data.paypal_subscription_id,
    premiumActivatedAt: data.premium_activated_at,
  }
}

export async function setUser(uid, patch) {
  if (!supabase) return

  const dbPatch = {}
  if (patch.isPremium !== undefined)            dbPatch.is_premium = patch.isPremium
  if (patch.email !== undefined)                dbPatch.email = patch.email
  if (patch.paypalSubscriptionId !== undefined) dbPatch.paypal_subscription_id = patch.paypalSubscriptionId
  if (patch.premiumActivatedAt !== undefined)   dbPatch.premium_activated_at = patch.premiumActivatedAt
  if (patch.chatUsage !== undefined)            dbPatch.chat_usage = patch.chatUsage
  if (patch.analysisUsage !== undefined)        dbPatch.analysis_usage = patch.analysisUsage

  await supabase
    .from('users')
    .upsert({ id: uid, ...dbPatch }, { onConflict: 'id' })
}

export function isPermanentPremium(email) {
  return email?.toLowerCase() === PERMANENT_PREMIUM_EMAIL
}
