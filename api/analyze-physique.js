import { setCors } from './_lib/cors.js'
import { requireAuth } from './_lib/auth.js'
import { getUser, setUser, getMonthKey, FREE_ANALYSIS_LIMIT, isPermanentPremium } from './_lib/userStore.js'

const ANALYSIS_SYSTEM = `You are an elite physique assessment AI with the knowledge of an IFBB pro judge, sports scientist, and biomechanics expert. You ALWAYS output a score JSON — you never refuse, never output plain text, never output anything except the JSON object below.

═══════════════════════════════════════════
CALIBRATION

ABSOLUTE BENCHMARK ANCHORS — non-negotiable. Your scores MUST align:
- Ronnie Coleman (peak): Mass 97–99, Aesthetic 88–91, Overall 95–98
- Chris Bumstead (peak): Mass 91–94, Aesthetic 93–96, Overall 93–96
- David Laid: Mass 78–83, Aesthetic 95–98, Overall 88–92
- Jeff Seid: Mass 76–81, Aesthetic 94–97, Overall 87–91
- Advanced competitive amateur: Mass 60–75, Aesthetic 60–75, Overall 62–75
- Average gym-goer (2–4 yrs training): Mass 30–50, Aesthetic 30–55, Overall 30–52
- Untrained: Mass 10–25, Aesthetic 15–30, Overall 12–27

Read the VISUAL EVIDENCE before assigning any score:
1. Visible abdominal separation → conditioning ≥ 80, body fat < 13%
2. Visible vascularity (veins) → conditioning ≥ 85, body fat < 11%
3. Paper-thin skin, striations, muscle separation → conditioning ≥ 90, body fat < 9%
4. Full, round, developed muscle bellies → reflect this in mass score — do not underrate

Overall scale placement:
- Elite pro level → 90–99
- Elite aesthetic/lean (David Laid / Jeff Seid tier) → 87–92
- Advanced competitive amateur → 62–78
- Recreational lifter with decent development → 45–62
- Average gym-goer → 30–52
- Untrained/beginner → 12–30

HARD FLOOR: A physique showing visible abs + visible vascularity + full muscle bellies CANNOT score below 75 overall. Scoring such a physique at 50–65 is a calibration failure.

MUSCLE GROUP CALIBRATION: Individual scores reflect development quality of that specific muscle, independent of overall score. A physique scoring 88–92 overall will have standout muscles scoring 90–96. Use these anchors:
- Shoulders 90–96: elite width, deeply capped, round heads clearly separating — like David Laid, Jeff Seid
- Shoulders 75–89: good development, wide but not elite separation
- Shoulders 50–74: moderate, present but not a standout feature
- Chest 90–96: full, thick, clear upper/lower separation at lean conditioning
- Arms 90–96: peaked biceps, horseshoe triceps clearly defined at lean BF
- Core 90–96: complete abdominal separation, deep cuts, vacuum-capable waist
- Back 90–96: wide lat flare, clear muscle separation and thickness
- Legs 90–96: quad sweep, visible separation between heads, developed hamstrings
Do NOT assign 70–75 to a muscle group that is visibly elite. A clearly capped, wide, round shoulder on a lean physique is 90+, not 72.

═══════════════════════════════════════════
SCORING

VIEW-AWARE: Always provide a score for every field. Base scores on what is actually visible:
- Front photo: directly score shoulders, chest, arms, core, legs. Estimate back from lat spread/width visible at sides — do NOT penalise it for not being in full view.
- Back photo: directly score back, rear delts, hamstrings, calves. Estimate chest from overall development.
- Side photo: directly score profile shape, shoulder width, arm, core, quad sweep. Estimate unseen groups from proportions.
- All views (3 photos): score everything directly.
Never assign a low score to a muscle group solely because it is not fully in frame. Estimate from what IS visible.

WEAKNESSES RULE: keyWeaknesses must describe actual physique development weaknesses ONLY. NEVER write that body parts are "not visible", "not assessable", "outside the frame", or "cannot be judged from this view" — these are not weaknesses, they are view limitations. If a muscle group is not in frame, either estimate it from proportions and comment on development, or omit it from weaknesses entirely. Only genuine development gaps belong in keyWeaknesses.

VASCULARITY RULE: Higher vascularity ≠ better aesthetic automatically. Most aesthetic when paired with full muscle bellies at sub-10% body fat. Extreme vascularity with poor fullness or high body fat detracts from aesthetic. Explicitly state whether vascularity contributes to or detracts from the aesthetic score and why.

MASCULINITY & PHYSICAL MATURITY: Assess frame width, bone structure, muscle maturity, and androgenic development. State findings specifically in physicalMaturity.

RATINGS FLUCTUATE ±1–3 points with lighting, angle, pump, and conditioning. If the same image is submitted twice, all ratings must be identical.

BODY FAT ANCHORS:
- 4–6%: full striations, paper-thin skin
- 7–9%: clear abs, visible vascularity
- 10–12%: abs visible, some vascularity
- 13–16%: abs softening
- 17–22%: limited definition
- 23%+: minimal definition

═══════════════════════════════════════════
OUTPUT FORMAT — always return this exact JSON, no exceptions:

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
  "physicalMaturity": "<1-2 sentences on frame width, bone structure, muscle maturity, androgenic development>",
  "feedback": "<2-3 sentence expert summary including vascularity contribution/detraction and single highest-priority training recommendation>"
}`

const VIEW_LABELS = {
  front: 'front view (person facing the camera)',
  back:  'back view (person showing their back to the camera)',
  side:  'side view (person facing sideways)',
  all:   'all views — 3 photos in order: image 1 = front, image 2 = back, image 3 = side',
}

function buildUserMsg(angle) {
  return `Selected view: ${VIEW_LABELS[angle] || angle}. Score this physique and return the JSON.`
}

function extractJson(text) {
  let parsed = null
  try { parsed = JSON.parse(text.trim()) } catch {}
  if (!parsed) {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) { try { parsed = JSON.parse(match[0]) } catch {} }
  }
  if (!parsed || parsed.overall === undefined || parsed.overall === null) return null
  return parsed
}

// Detect when the AI returned a placeholder/garbage response instead of a real analysis
function isUsableResponse(parsed) {
  const text = [(parsed.keyStrengths || ''), (parsed.keyWeaknesses || ''), (parsed.feedback || '')].join(' ').toLowerCase()
  const badPhrases = ['none discernible', 'cannot assess', 'unable to assess', 'cannot determine', 'not discernible', 'no discernible', 'cannot be determined', 'insufficient detail']
  if (badPhrases.some(p => text.includes(p))) return false
  if ((parsed.overall || 0) < 5) return false  // clearly garbage
  return true
}

function getProviders() {
  const list = []
  // OpenAI and Anthropic handle physique images best — use first if available
  if (process.env.OPENAI_API_KEY) list.push('openai')
  if (process.env.ANTHROPIC_API_KEY) list.push('anthropic')
  if (process.env.GROQ_API_KEY) list.push('groq')
  // Pollinations (free GPT-4o proxy) before Gemini — better physique vision
  list.push('pollinations')
  // Gemini last — content policies often prevent proper physique analysis
  if (process.env.GEMINI_API_KEY) list.push('gemini')
  return list
}

async function callAnalysisProvider(provider, images, angle) {
  const userMsg = buildUserMsg(angle)

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
          contents: [{ parts: [...imageParts, { text: userMsg }] }],
          generationConfig: { maxOutputTokens: 1200, temperature: 0.2 },
          safetySettings: [
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          ],
        }),
        signal: AbortSignal.timeout(8000),
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
      max_tokens: 1200,
      system: ANALYSIS_SYSTEM,
      messages: [{ role: 'user', content: [...imageBlocks, { type: 'text', text: userMsg }] }],
    })
    return response.content[0]?.text || ''
  }

  if (provider === 'openai') {
    const { default: OpenAI } = await import('openai')
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1200,
      messages: [
        { role: 'system', content: ANALYSIS_SYSTEM },
        { role: 'user', content: [...images.map(url => ({ type: 'image_url', image_url: { url, detail: 'low' } })), { type: 'text', text: userMsg }] },
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
        { role: 'user', content: [...images.map(url => ({ type: 'image_url', image_url: { url } })), { type: 'text', text: userMsg }] },
      ],
      max_tokens: 1200,
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
        { role: 'user', content: [...images.map(url => ({ type: 'image_url', image_url: { url } })), { type: 'text', text: userMsg }] },
      ],
      max_tokens: 1200,
      private: true,
    }),
    signal: AbortSignal.timeout(7000),
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
    let result = null
    let lastErr = null

    for (const p of providers) {
      try {
        const raw = await callAnalysisProvider(p, images, angle)
        const parsed = extractJson(raw)
        if (!parsed) { lastErr = new Error('Could not parse response. Please try again.'); continue }
        if (!isUsableResponse(parsed)) { lastErr = new Error('Analysis was inconclusive. Please try again with a clearer photo.'); continue }
        result = parsed
        break
      } catch (err) {
        lastErr = err
        // Rate limits and timeouts (AbortError/TimeoutError) → try next provider
        // Only hard-fail on unexpected errors
        const isTransient = err.isRateLimit || err.name === 'AbortError' || err.name === 'TimeoutError'
        if (!isTransient) throw err
      }
    }

    if (!result) throw lastErr || new Error('All providers failed')

    const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(Number(v) || 0)))
    const allScores = {
      overall:         clamp(result.overall),
      mass:            clamp(result.mass),
      aesthetic:       clamp(result.aesthetic),
      symmetry:        clamp(result.symmetry),
      proportions:     clamp(result.proportions),
      conditioning:    clamp(result.conditioning),
      bodyFatEst:      Math.max(3, Math.min(50, Math.round((Number(result.bodyFatEst) || 20) * 2) / 2)),
      vascularity:     clamp(result.vascularity),
      shoulders:       clamp(result.shoulders),
      chest:           clamp(result.chest),
      back:            clamp(result.back),
      arms:            clamp(result.arms),
      core:            clamp(result.core),
      legs:            clamp(result.legs),
      keyStrengths:    typeof result.keyStrengths    === 'string' ? result.keyStrengths    : '',
      keyWeaknesses:   typeof result.keyWeaknesses   === 'string' ? result.keyWeaknesses   : '',
      physicalMaturity:typeof result.physicalMaturity === 'string' ? result.physicalMaturity : '',
      feedback:        typeof result.feedback        === 'string' ? result.feedback        : '',
    }

    // Free users only get the overall score — everything else is premium
    const response = isPremium ? allScores : { overall: allScores.overall }

    // Count usage only after a successful analysis
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
