import { setCors } from './_lib/cors.js'
import { requireAuth } from './_lib/auth.js'
import { getUser, setUser, getMonthKey, FREE_ANALYSIS_LIMIT, isPermanentPremium } from './_lib/userStore.js'

const ANALYSIS_SYSTEM = `You are an expert physique assessment AI. Analyze the provided physique photo(s) and return ONLY a valid JSON object — no markdown, no explanation, no code fences, just raw JSON.

Required fields:
{
  "aesthetic": <integer 0-100>,
  "mass": <integer 0-100>,
  "symmetry": <integer 0-100>,
  "proportions": <integer 0-100>,
  "conditioning": <integer 0-100>,
  "bodyFatEst": <integer, estimated body fat percentage e.g. 15>,
  "vascularity": <integer 0-100>,
  "shoulders": <integer 0-100>,
  "chest": <integer 0-100>,
  "back": <integer 0-100>,
  "arms": <integer 0-100>,
  "core": <integer 0-100>,
  "legs": <integer 0-100>,
  "feedback": "<2-3 sentence expert feedback identifying the strongest muscle group and the single highest-priority area to improve>"
}

Scoring calibration: average gym-goer = 40–55, experienced lifter = 55–70, competitive physique = 70–85, elite competitive = 85+. Be honest and specific. Return ONLY the JSON object.`

function extractJson(text) {
  try { return JSON.parse(text.trim()) } catch {}
  const match = text.match(/\{[\s\S]*\}/)
  if (match) { try { return JSON.parse(match[0]) } catch {} }
  return null
}

function getProvider() {
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic'
  if (process.env.OPENAI_API_KEY) return 'openai'
  return 'pollinations'
}

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const auth = await requireAuth(req, res)
  if (!auth) return

  const monthKey = getMonthKey()
  let userData = null
  let isPremium = false

  if (!auth.isDemo) {
    userData = await getUser(auth.uid)
    isPremium = userData.isPremium || isPermanentPremium(auth.email)

    if (!isPremium) {
      const count = userData.analysisUsage?.[monthKey] || 0
      if (count >= FREE_ANALYSIS_LIMIT) {
        return res.status(403).json({ error: 'Monthly analysis limit reached. Upgrade to Premium for unlimited analyses.' })
      }
    }
  }

  const { images, angle = 'front' } = req.body
  if (!images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: 'No images provided.' })
  }

  const provider = getProvider()

  try {
    let raw = ''

    if (provider === 'anthropic') {
      const { default: Anthropic } = await import('@anthropic-ai/sdk')
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

      const imageBlocks = images.map(dataUrl => {
        const [header, data] = dataUrl.split(',')
        const mediaType = header.match(/:(.*?);/)?.[1] || 'image/jpeg'
        return { type: 'image', source: { type: 'base64', media_type: mediaType, data } }
      })

      const response = await client.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 700,
        system: ANALYSIS_SYSTEM,
        messages: [{
          role: 'user',
          content: [
            ...imageBlocks,
            { type: 'text', text: `Analyze this physique (view: ${angle}). Return only the JSON object.` },
          ],
        }],
      })
      raw = response.content[0]?.text || ''

    } else if (provider === 'openai') {
      const { default: OpenAI } = await import('openai')
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 700,
        messages: [
          { role: 'system', content: ANALYSIS_SYSTEM },
          {
            role: 'user',
            content: [
              ...images.map(url => ({ type: 'image_url', image_url: { url, detail: 'low' } })),
              { type: 'text', text: `Analyze this physique (view: ${angle}). Return only the JSON object.` },
            ],
          },
        ],
      })
      raw = completion.choices[0].message.content || ''

    } else {
      // Pollinations.ai — free fallback with vision support
      const pollinationsRes = await fetch('https://text.pollinations.ai/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openai',
          messages: [
            { role: 'system', content: ANALYSIS_SYSTEM },
            {
              role: 'user',
              content: [
                ...images.map(url => ({ type: 'image_url', image_url: { url } })),
                { type: 'text', text: `Analyze this physique (view: ${angle}). Return only the JSON object.` },
              ],
            },
          ],
          max_tokens: 700,
          private: true,
        }),
        signal: AbortSignal.timeout(30000),
      })

      if (!pollinationsRes.ok) {
        const errText = await pollinationsRes.text().catch(() => '')
        throw new Error(`Analysis failed (${pollinationsRes.status}): ${errText.slice(0, 120)}`)
      }

      const pollinationsData = await pollinationsRes.json()
      raw = pollinationsData.choices?.[0]?.message?.content || ''
    }

    const scores = extractJson(raw)
    if (!scores) {
      throw new Error('Could not parse the analysis response. Please try again with a clearer photo.')
    }

    // Clamp all numeric fields to valid ranges
    const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(Number(v) || 0)))
    const validated = {
      aesthetic:   clamp(scores.aesthetic),
      mass:        clamp(scores.mass),
      symmetry:    clamp(scores.symmetry),
      proportions: clamp(scores.proportions),
      conditioning:clamp(scores.conditioning),
      bodyFatEst:  Math.max(3, Math.min(50, Math.round(Number(scores.bodyFatEst) || 20))),
      vascularity: clamp(scores.vascularity),
      shoulders:   clamp(scores.shoulders),
      chest:       clamp(scores.chest),
      back:        clamp(scores.back),
      arms:        clamp(scores.arms),
      core:        clamp(scores.core),
      legs:        clamp(scores.legs),
      feedback:    typeof scores.feedback === 'string' ? scores.feedback : '',
    }

    // Update usage count (only after a successful analysis)
    if (!auth.isDemo && !isPremium) {
      const count = userData.analysisUsage?.[monthKey] || 0
      await setUser(auth.uid, {
        analysisUsage: { ...(userData.analysisUsage || {}), [monthKey]: count + 1 },
      })
    }

    res.json({ scores: validated })
  } catch (err) {
    console.error('[analyze-physique error]', err.message)
    res.status(500).json({ error: err.message })
  }
}
