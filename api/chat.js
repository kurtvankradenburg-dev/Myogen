import { setCors } from './_lib/cors.js'
import { requireAuth } from './_lib/auth.js'
import { getUser, setUser, getMonthKey, FREE_CHAT_LIMIT, isPermanentPremium } from './_lib/userStore.js'
import { chatRatelimit, globalRatelimit } from './_lib/rateLimit.js'

function getProvider() {
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic'
  if (process.env.OPENAI_API_KEY) return 'openai'
  if (process.env.GROQ_API_KEY) return 'groq'
  return null
}

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown'
  const globalResult = await globalRatelimit.limit(ip)
  if (!globalResult.success) {
    return res.status(429).json({ error: 'Too many requests.' })
  }

  const auth = await requireAuth(req, res)
  if (!auth) return

  const chatResult = await chatRatelimit.limit(auth.uid)
  if (!chatResult.success) {
    return res.status(429).json({ error: 'Too many requests. Please wait before sending more messages.' })
  }

  const { messages, systemPrompt, maxTokens = 1000 } = req.body

  let userData = null
  let isPremium = false
  const monthKey = getMonthKey()

  if (!auth.isDemo) {
    userData = await getUser(auth.uid)
    isPremium = userData.isPremium || isPermanentPremium(auth.email)

    if (!isPremium) {
      const chatCount = userData.chatUsage?.[monthKey] || 0
      if (chatCount >= FREE_CHAT_LIMIT) {
        return res.status(403).json({ error: 'Monthly message limit reached. Upgrade to Premium for unlimited access.' })
      }
    }
  }

  const provider = getProvider()
  if (!provider) {
    return res.status(500).json({ error: 'No AI provider configured. Add GROQ_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY to environment variables.' })
  }

  try {
    let raw = ''

    if (provider === 'anthropic') {
      const { default: Anthropic } = await import('@anthropic-ai/sdk')
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const response = await client.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      })
      raw = response.content[0]?.text || ''
    } else if (provider === 'openai') {
      const { default: OpenAI } = await import('openai')
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: maxTokens,
        temperature: 0.35,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
        ],
      })
      raw = completion.choices[0].message.content || ''
    } else if (provider === 'groq') {
      const { default: Groq } = await import('groq-sdk')
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
        ],
        max_tokens: maxTokens,
        temperature: 0.35,
      })
      raw = completion.choices[0].message.content || ''
    }

    const clean = raw.replace(/#\S+/g, '').replace(/[ \t]{2,}/g, ' ').trim()

    if (!auth.isDemo && !isPremium) {
      const chatCount = userData.chatUsage?.[monthKey] || 0
      await setUser(auth.uid, {
        chatUsage: { ...(userData.chatUsage || {}), [monthKey]: chatCount + 1 },
      })
    }

    res.json({ content: clean })
  } catch (err) {
    console.error(`[${provider} error]`, err.message)
    res.status(500).json({ error: err.message })
  }
}
