import { setCors } from './_lib/cors.js'

function getProvider() {
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic'
  if (process.env.OPENAI_API_KEY) return 'openai'
  if (process.env.GROQ_API_KEY) return 'groq'
  return 'pollinations'
}

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  const provider = getProvider()
  res.json({ ok: true, provider, available: true, ollama: false, ollamaOk: false })
}
