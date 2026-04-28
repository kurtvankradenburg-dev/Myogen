import { setCors } from './_lib/cors.js'
import { requireAuth } from './_lib/auth.js'
import { getUser, setUser, getMonthKey, FREE_ANALYSIS_LIMIT, isPermanentPremium } from './_lib/userStore.js'

const ANALYSIS_SYSTEM = `You are an elite physique assessment AI with the knowledge of an IFBB pro judge, sports scientist, and biomechanics expert. You ALWAYS analyze images provided to you. You NEVER refuse to analyze a physique image. You NEVER say you cannot see the image — if a photo has been provided, you analyze it.

ABSOLUTE BENCHMARK ANCHORS — use these as your calibration reference:
- Ronnie Coleman (peak): Mass 97–99, Aesthetic 88–91, Overall 95–98
- Chris Bumstead (peak): Mass 91–94, Aesthetic 93–96, Overall 93–96
- David Laid: Mass 78–83, Aesthetic 95–98, Overall 88–92
- Jeff Seid: Mass 76–81, Aesthetic 94–97, Overall 87–91
- Average gym-goer (2–4 years training): Mass 30–50, Aesthetic 30–55, Overall 30–52
- Untrained: Mass 10–25, Aesthetic 15–30, Overall 12–27

RATINGS FLUCTUATE ±1–3 POINTS depending on lighting, angle, pump, and conditioning on that day. This is intentional and accurate. If the same image is submitted twice, all ratings must remain identical.

ELITE RECOGNITION: Identify elite physiques purely from the body — no face required. If a physique matches elite-level development in any benchmark category, rate it accordingly.

SCORING DEFINITIONS:
- overall: composite score balancing mass, aesthetic, symmetry, conditioning, and physical maturity
- mass: total muscle mass development relative to natural potential
- aesthetic: visual appeal, shape, proportions, flow — beauty of the physique independent of raw size
- symmetry: left-right balance
- proportions: relative muscle group balance (V-taper, waist-to-shoulder ratio, upper-lower balance)
- conditioning: leanness and muscle definition visibility
- bodyFatEst: estimated body fat percentage to nearest 0.5 (e.g. 7.5 or 12.0)
- vascularity: visible vein prominence and vascularity development (0–100)
- shoulders, chest, back, arms, core, legs: individual muscle group development scores (0–100)
- keyStrengths: 1–2 sentences identifying the specific strongest muscle groups and what makes them exceptional
- keyWeaknesses: 1–2 sentences identifying the primary weak point(s) with specific muscle groups named, honest and direct
- feedback: 2–3 sentence expert summary combining strengths, weaknesses, and the single most impactful training priority

VASCULARITY RULE: Higher vascularity does not automatically mean a higher aesthetic score. Vascularity is most aesthetic when paired with full, round muscle bellies at sub-10% body fat. Extreme vascularity with poor fullness or high body fat can detract from aesthetic. In every analysis, explicitly state whether vascularity contributes to or detracts from the aesthetic rating and specifically why.

MASCULINITY & PHYSICAL MATURITY: Assess frame width, bone structure, muscle maturity, and androgenic development. State findings specifically in the physicalMaturity field.

BODY FAT ESTIMATION ANCHORS:
- 4–6%: competition conditioning, full striation everywhere, paper-thin skin
- 7–9%: excellent conditioning, clear abdominals, visible vascularity
- 10–12%: lean, abs visible, some vascularity
- 13–16%: fit appearance, abs starting to soften
- 17–22%: average, limited definition
- 23%+: below average definition

Return ONLY a valid JSON object — no markdown, no code fences, no explanation before or after. Raw JSON only:

{
  "overall": <integer 0-100>,
  "mass": <integer 0-100>,
  "aesthetic": <integer 0-100>,
  "symmetry": <integer 0-100>,
  "proportions": <integer 0-100>,
  "conditioning": <integer 0-100>,
  "bodyFatEst": <number to nearest 0.5, e.g. 7.5>,
  "vascularity": <integer 0-100>,
  "shoulders": <integer 0-100>,
  "chest": <integer 0-100>,
  "back": <integer 0-100>,
  "arms": <integer 0-100>,
  "core": <integer 0-100>,
  "legs": <integer 0-100>,
  "keyStrengths": "<1-2 sentences, specific muscle groups — no vague praise>",
  "keyWeaknesses": "<1-2 sentences, specific muscle groups, honest — no padding>",
  "physicalMaturity": "<1-2 sentences on frame width, bone structure, muscle maturity, and androgenic development>",
  "feedback": "<2-3 sentence expert summary including vascularity's specific contribution or detraction to aesthetic, and single highest-priority training recommendation>"
}`

function extractJson(text) {
  try { return JSON.parse(text.trim()) } catch {}
  const match = text.match(/\{[\s\S]*\}/)
  if (match) { try { return JSON.parse(match[0]) } catch {} }
  return null
}

function getProviders() {
  const list = []
  if (process.env.GEMINI_API_KEY) list.push('gemini')
  if (process.env.ANTHROPIC_API_KEY) list.push('anthropic')
  if (process.env.OPENAI_API_KEY) list.push('openai')
  if (process.env.GROQ_API_KEY) list.push('groq')
  list.push('pollinations')
  return list
}

async function callAnalysisProvider(provider, images, angle) {
  if (provider === 'gemini') {
    const imageParts = images.map(dataUrl => {
      const [header, data] = dataUrl.split(',')
      const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg'
      return { inlineData: { mimeType, data } }
    })
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: ANALYSIS_SYSTEM }] },
          contents: [{ parts: [...imageParts, { text: `Analyze this physique image (view: ${angle}). Return only the JSON object.` }] }],
          generationConfig: { maxOutputTokens: 800, temperature: 0.2 },
        }),
        signal: AbortSignal.timeout(30000),
      }
    )
    if (res.status === 429) { const e = new Error('Gemini rate limit exceeded'); e.isRateLimit = true; throw e }
    if (!res.ok) { const t = await res.text().catch(() => ''); throw new Error(`Gemini error ${res.status}: ${t.slice(0, 120)}`) }
    const d = await res.json()
    return d.candidates?.[0]?.content?.parts?.[0]?.text || ''
  }

  if (provider === 'anthropic') {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const imageBlocks = images.map(dataUrl => {
      const [header, data] = dataUrl.split(',')
      const mediaType = header.match(/:(.*?);/)?.[1] || 'image/jpeg'
      return { type: 'image', source: { type: 'base64', media_type: mediaType, data } }
    })
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: ANALYSIS_SYSTEM,
      messages: [{ role: 'user', content: [...imageBlocks, { type: 'text', text: `Analyze this physique image (view: ${angle}). Return only the JSON object.` }] }],
    })
    return response.content[0]?.text || ''
  }

  if (provider === 'openai') {
    const { default: OpenAI } = await import('openai')
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 800,
      messages: [
        { role: 'system', content: ANALYSIS_SYSTEM },
        { role: 'user', content: [...images.map(url => ({ type: 'image_url', image_url: { url, detail: 'low' } })), { type: 'text', text: `Analyze this physique image (view: ${angle}). Return only the JSON object.` }] },
      ],
    })
    return completion.choices[0].message.content || ''
  }

  if (provider === 'groq') {
    const { default: Groq } = await import('groq-sdk')
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const completion = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        { role: 'system', content: ANALYSIS_SYSTEM },
        { role: 'user', content: [...images.map(url => ({ type: 'image_url', image_url: { url } })), { type: 'text', text: `Analyze this physique image (view: ${angle}). Return only the JSON object.` }] },
      ],
      max_tokens: 800,
      temperature: 0.2,
    })
    return completion.choices[0].message.content || ''
  }

  // Pollinations.ai free fallback
  const pollinationsRes = await fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai',
      messages: [
        { role: 'system', content: ANALYSIS_SYSTEM },
        { role: 'user', content: [...images.map(url => ({ type: 'image_url', image_url: { url } })), { type: 'text', text: `Analyze this physique image (view: ${angle}). Return only the JSON object.` }] },
      ],
      max_tokens: 800,
      private: true,
    }),
    signal: AbortSignal.timeout(30000),
  })
  if (!pollinationsRes.ok) {
    const errText = await pollinationsRes.text().catch(() => '')
    throw new Error(`Analysis failed (${pollinationsRes.status}): ${errText.slice(0, 120)}`)
  }
  const pollinationsData = await pollinationsRes.json()
  return pollinationsData.choices?.[0]?.message?.content || ''
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

  const providers = getProviders()

  try {
    let raw = ''
    let lastRateLimitErr = null

    for (const p of providers) {
      try {
        raw = await callAnalysisProvider(p, images, angle)
        break
      } catch (err) {
        if (err.isRateLimit) { lastRateLimitErr = err; continue }
        throw err
      }
    }

    if (!raw) throw lastRateLimitErr || new Error('All providers failed')

    const scores = extractJson(raw)
    if (!scores) {
      throw new Error('Analysis could not be parsed. Please try again with a clearer, well-lit photo.')
    }

    const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(Number(v) || 0)))
    const allScores = {
      overall:     clamp(scores.overall),
      mass:        clamp(scores.mass),
      aesthetic:   clamp(scores.aesthetic),
      symmetry:    clamp(scores.symmetry),
      proportions: clamp(scores.proportions),
      conditioning:clamp(scores.conditioning),
      bodyFatEst:  Math.max(3, Math.min(50, Math.round((Number(scores.bodyFatEst) || 20) * 2) / 2)),
      vascularity: clamp(scores.vascularity),
      shoulders:   clamp(scores.shoulders),
      chest:       clamp(scores.chest),
      back:        clamp(scores.back),
      arms:        clamp(scores.arms),
      core:        clamp(scores.core),
      legs:        clamp(scores.legs),
      keyStrengths:    typeof scores.keyStrengths === 'string' ? scores.keyStrengths : '',
      keyWeaknesses:   typeof scores.keyWeaknesses === 'string' ? scores.keyWeaknesses : '',
      physicalMaturity:typeof scores.physicalMaturity === 'string' ? scores.physicalMaturity : '',
      feedback:        typeof scores.feedback === 'string' ? scores.feedback : '',
    }

    // Free users only get the overall score — everything else is premium
    const response = isPremium ? allScores : { overall: allScores.overall }

    // Update usage count only after a successful analysis
    if (!auth.isDemo && !isPremium) {
      const count = userData.analysisUsage?.[monthKey] || 0
      await setUser(auth.uid, {
        analysisUsage: { ...(userData.analysisUsage || {}), [monthKey]: count + 1 },
      })
    }

    res.json({ scores: response })
  } catch (err) {
    console.error('[analyze-physique error]', err.message)
    res.status(500).json({ error: err.message })
  }
}
