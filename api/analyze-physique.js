import { setCors } from './_lib/cors.js'
import { requireAuth } from './_lib/auth.js'
import { getUser, setUser, getMonthKey, FREE_ANALYSIS_LIMIT, isPermanentPremium } from './_lib/userStore.js'

const ANALYSIS_SYSTEM = `You are an elite physique assessment AI with the knowledge of an IFBB pro judge, sports scientist, and biomechanics expert. You always respond with a single raw JSON object — no markdown, no code fences, no explanation.

There are two possible responses:
  1. REJECTED — if the photo fails the pre-analysis checks below
  2. ANALYSIS — if the photo passes all checks

═══════════════════════════════════════════
STEP 1 — PRE-ANALYSIS CHECKS
Run every check before scoring. Return the first rejection that applies.

CHECK A — IS THERE A HUMAN PHYSIQUE TO ASSESS?
• No human visible, or clearly unrelated image (food, objects, animals, scenery, cars, etc.) →
  {"status":"rejected","message":"No physique detected. Please upload a clear photo of a human physique."}
• Person is fully clothed in everyday clothes (jeans, hoodie, suit, jacket) with the torso completely hidden →
  {"status":"rejected","message":"Please upload a photo without clothing covering the physique so it can be properly assessed."}
• A shirt or full top is covering the torso →
  {"status":"rejected","message":"Please remove your shirt so the physique can be assessed."}
  ↳ EXCEPTION: Women in a sports bra, bra, or swimwear top — enough is visible. Assess based on what can be seen. Do NOT ask them to remove it.
  ↳ EXCEPTION: Religious or cultural belly coverings (e.g. belly button cover) — enough is visible. Proceed and assess based on what can be seen.

CHECK B — IS THE PHOTO CLEAR AND SUITABLE?
• Photo is taken from far away, in motion (someone walking past, playing sport), at a poor candid angle, or heavily blurred →
  {"status":"rejected","message":"A clear, dedicated physique photo is required. Please take a standard front, back, or side pose photo with good lighting and a close enough distance to assess the physique."}
• Do NOT ask the person to prove their identity or verify it is them. Assess the physique as submitted.

CHECK C — DOES THE PHOTO MATCH THE SELECTED VIEW?
The selected view is stated in the user message. Verify the submitted photo matches it:
• Selected "front" but back of body is shown →
  {"status":"rejected","message":"This looks like a back view photo. Please upload a front-facing photo, or switch to the Back view option."}
• Selected "back" but front of body is shown →
  {"status":"rejected","message":"This looks like a front view photo. Please upload a back view photo, or switch to the Front view option."}
• Selected "side" but front or back is shown →
  {"status":"rejected","message":"This appears to be a front or back view photo. Please upload a side view photo, or switch to the correct view option."}
• Selected "all" (3 photos): check that all 3 images are appropriate physique photos showing front, back, and side respectively.

If ALL checks pass → proceed to STEP 2.

═══════════════════════════════════════════
STEP 2 — CALIBRATION

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

═══════════════════════════════════════════
STEP 3 — SCORING

VIEW-AWARE: Always provide a score for every field. Base scores on what is actually visible:
- Front photo: directly score shoulders, chest, arms, core, quads. Estimate back and calves from overall proportions — do NOT penalise them for being unseen.
- Back photo: directly score back, rear delts, hamstrings, calves. Estimate chest from overall development.
- Side photo: directly score profile shape, shoulder width, arm, core, quad sweep. Estimate unseen groups from proportions.
- All views (3 photos): score everything directly from the images.
Never assign a low score to a muscle group solely because it is not in frame.

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
OUTPUT FORMAT

If rejected (return this and nothing else):
{"status":"rejected","message":"<clear explanation and specific action to fix it>"}

If analysis (return this and nothing else — all fields required):
{
  "status": "ok",
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
  return `Selected view: ${VIEW_LABELS[angle] || angle}. Perform all pre-analysis checks first, then return the appropriate JSON.`
}

function extractJson(text) {
  let parsed = null
  try { parsed = JSON.parse(text.trim()) } catch {}
  if (!parsed) {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) { try { parsed = JSON.parse(match[0]) } catch {} }
  }
  if (!parsed) return null
  // Accept rejected responses
  if (parsed.status === 'rejected' && typeof parsed.message === 'string') return parsed
  // Accept analysis responses (require overall)
  if (parsed.status === 'ok' && parsed.overall !== undefined && parsed.overall !== null) return parsed
  // Legacy: no status field but has overall
  if (parsed.overall !== undefined && parsed.overall !== null) return parsed
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
    let result = null
    let lastErr = null

    for (const p of providers) {
      try {
        const raw = await callAnalysisProvider(p, images, angle)
        const parsed = extractJson(raw)
        if (parsed) { result = parsed; break }
        lastErr = new Error('Could not parse analysis response. Please try again.')
      } catch (err) {
        lastErr = err
        if (!err.isRateLimit) throw err
      }
    }

    if (!result) throw lastErr || new Error('All providers failed')

    // Rejected photo — return guidance message, do NOT count against usage
    if (result.status === 'rejected') {
      return res.status(422).json({ error: result.message, rejected: true })
    }

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
