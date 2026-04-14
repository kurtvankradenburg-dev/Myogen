import { setCors } from './_lib/cors.js'

function getProvider() {
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic'
  if (process.env.OPENAI_API_KEY) return 'openai'
  if (process.env.GROQ_API_KEY) return 'groq'
  return 'none'
}

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  res.json({ ok: true, provider: getProvider(), ollama: false, ollamaOk: false })
}
