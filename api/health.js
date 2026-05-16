import { setCors } from './_lib/cors.js'

function getProvider() {
  if (process.env.GROQ_API_KEY) return 'groq'
  if (process.env.GEMINI_API_KEY) return 'gemini'
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic'
  if (process.env.OPENAI_API_KEY) return 'openai'
  return 'pollinations'
}

async function validateProvider(provider) {
  try {
    if (provider === 'groq') {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
        signal: AbortSignal.timeout(4000),
      })
      return res.ok || res.status !== 401
    }
    if (provider === 'gemini') {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`,
        { signal: AbortSignal.timeout(4000) }
      )
      return res.ok
    }
    if (provider === 'anthropic') {
      return !!process.env.ANTHROPIC_API_KEY
    }
    if (provider === 'openai') {
      return !!process.env.OPENAI_API_KEY
    }
    // pollinations is always "available" as free fallback
    return true
  } catch {
    return false
  }
}

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  const provider = getProvider()
  const valid = await validateProvider(provider)
  res.json({ ok: valid, provider, available: valid, ollama: false, ollamaOk: false })
}
