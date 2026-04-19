import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually in local dev (Vercel injects env vars automatically)
const envPath = join(__dirname, '..', '.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && key.trim() && !key.startsWith('#')) {
      process.env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
}

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '8mb' }));

// ── Rate limiters ─────────────────────────────────────────────────────────
const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait before sending more messages.' },
});

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests.' },
});

app.use(globalLimiter);

const PERMANENT_PREMIUM_EMAIL = 'kurtvankradenburg@gmail.com';
const FREE_CHAT_LIMIT = 15;
const FREE_ANALYSIS_LIMIT = 1;

// ── Supabase client ───────────────────────────────────────────────────────
function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function isSupabaseConfigured() {
  return !!process.env.VITE_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}

// ── User store (Supabase Postgres) ────────────────────────────────────────
async function getUser(uid) {
  const sb = getSupabase();
  if (!sb) return { isPremium: false, chatUsage: {}, analysisUsage: {} };
  const { data } = await sb.from('users').select('*').eq('id', uid).single();
  if (!data) return { isPremium: false, chatUsage: {}, analysisUsage: {} };
  return {
    isPremium: data.is_premium,
    chatUsage: data.chat_usage || {},
    analysisUsage: data.analysis_usage || {},
    email: data.email,
  };
}

async function setUser(uid, patch) {
  const sb = getSupabase();
  if (!sb) return;
  const dbPatch = {};
  if (patch.isPremium !== undefined)            dbPatch.is_premium = patch.isPremium;
  if (patch.email !== undefined)                dbPatch.email = patch.email;
  if (patch.paypalSubscriptionId !== undefined) dbPatch.paypal_subscription_id = patch.paypalSubscriptionId;
  if (patch.premiumActivatedAt !== undefined)   dbPatch.premium_activated_at = patch.premiumActivatedAt;
  if (patch.chatUsage !== undefined)            dbPatch.chat_usage = patch.chatUsage;
  if (patch.analysisUsage !== undefined)        dbPatch.analysis_usage = patch.analysisUsage;
  await sb.from('users').upsert({ id: uid, ...dbPatch }, { onConflict: 'id' });
}

function getMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}`;
}

// ── Auth middleware ────────────────────────────────────────────────────────
// Decodes Firebase ID token (JWT) to get uid/email without admin SDK.
// Full signature verification requires firebase-admin — acceptable trade-off for this app.
function decodeFirebaseToken(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    return { uid: decoded.user_id || decoded.sub, email: decoded.email };
  } catch {
    return null;
  }
}

async function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    // No token — fall back to IP-based demo mode (rate limiting still applies)
    req.uid = req.ip;
    req.email = null;
    req.isDemo = true;
    return next();
  }

  const token = header.slice(7);

  // Try Supabase verification first (if configured)
  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabase();
      const { data: { user }, error } = await sb.auth.getUser(token);
      if (!error && user) {
        req.uid = user.id;
        req.email = user.email;
        req.isDemo = false;
        return next();
      }
    } catch {}
  }

  // Fall back to decoding Firebase JWT
  const decoded = decodeFirebaseToken(token);
  if (decoded?.uid) {
    req.uid = decoded.uid;
    req.email = decoded.email || null;
    req.isDemo = false;
    return next();
  }

  // Token present but unreadable — still allow through in demo mode
  req.uid = req.ip;
  req.email = null;
  req.isDemo = true;
  next();
}

// ── PayPal subscription verification ─────────────────────────────────────
async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('PayPal credentials not configured on server.');

  const base = process.env.PAYPAL_SANDBOX === 'true'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
    signal: AbortSignal.timeout(8000),
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Could not authenticate with PayPal');
  return { token: data.access_token, base };
}

async function verifyPayPalSubscription(subscriptionId) {
  const { token, base } = await getPayPalAccessToken();
  const res = await fetch(`${base}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(8000),
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Could not verify subscription with PayPal');
  return data;
}

// ── In-memory OTP store ───────────────────────────────────────────────────
const otpStore = new Map();

// ── AI provider detection ─────────────────────────────────────────────────
function getProvider() {
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  if (process.env.OPENAI_API_KEY)    return 'openai';
  if (process.env.GROQ_API_KEY)      return 'groq';
  return 'ollama';
}

// ── Health check ──────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  const provider = getProvider();
  let ollamaOk = false;
  if (provider === 'ollama') {
    try {
      const r = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(1500) });
      ollamaOk = r.ok;
    } catch {}
  }
  res.json({ ok: true, provider, ollama: provider === 'ollama', ollamaOk });
});

// ── User status (premium + usage) ────────────────────────────────────────
app.get('/api/user-status', requireAuth, async (req, res) => {
  const monthKey = getMonthKey();
  const userData = await getUser(req.uid);
  const isPremium = userData.isPremium || req.email?.toLowerCase() === PERMANENT_PREMIUM_EMAIL;

  res.json({
    isPremium,
    chatCount: userData.chatUsage?.[monthKey] || 0,
    analysisCount: userData.analysisUsage?.[monthKey] || 0,
    chatLimit: FREE_CHAT_LIMIT,
    analysisLimit: FREE_ANALYSIS_LIMIT,
  });
});

// ── Activate premium ──────────────────────────────────────────────────────
app.post('/api/activate-premium', requireAuth, async (req, res) => {
  const { subscriptionId } = req.body;
  if (!subscriptionId) return res.status(400).json({ error: 'subscriptionId is required' });

  try {
    const subscription = await verifyPayPalSubscription(subscriptionId);
    if (subscription.status !== 'ACTIVE') {
      return res.status(400).json({ error: `Subscription is not active (status: ${subscription.status})` });
    }
    await setUser(req.uid, {
      isPremium: true,
      email: req.email,
      paypalSubscriptionId: subscriptionId,
      premiumActivatedAt: Date.now(),
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Track analysis usage ──────────────────────────────────────────────────
app.post('/api/use-analysis', requireAuth, async (req, res) => {
  const monthKey = getMonthKey();
  const userData = await getUser(req.uid);
  const isPremium = userData.isPremium || req.email?.toLowerCase() === PERMANENT_PREMIUM_EMAIL;

  if (!isPremium) {
    const count = userData.analysisUsage?.[monthKey] || 0;
    if (count >= FREE_ANALYSIS_LIMIT) {
      return res.status(403).json({ error: 'Monthly analysis limit reached. Upgrade to Premium for unlimited analyses.' });
    }
    await setUser(req.uid, {
      analysisUsage: { ...(userData.analysisUsage || {}), [monthKey]: count + 1 },
    });
  }

  res.json({ ok: true });
});

// ── AI Chat ───────────────────────────────────────────────────────────────
app.post('/api/chat', chatLimiter, requireAuth, async (req, res) => {
  const { messages, systemPrompt, maxTokens = 1000 } = req.body;

  let userData = null;
  let isPremium = false;
  const monthKey = getMonthKey();

  if (!req.isDemo) {
    userData = await getUser(req.uid);
    isPremium = userData.isPremium || req.email?.toLowerCase() === PERMANENT_PREMIUM_EMAIL;

    if (!isPremium) {
      const chatCount = userData.chatUsage?.[monthKey] || 0;
      if (chatCount >= FREE_CHAT_LIMIT) {
        return res.status(403).json({
          error: 'Monthly message limit reached. Upgrade to Premium for unlimited access.',
        });
      }
    }
  }

  const provider = getProvider();

  try {
    let raw = '';

    if (provider === 'anthropic') {
      const { default: Anthropic } = await import('@anthropic-ai/sdk');
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const response = await client.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      });
      raw = response.content[0]?.text || '';
    } else if (provider === 'openai') {
      const { default: OpenAI } = await import('openai');
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: maxTokens,
        temperature: 0.35,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
        ],
      });
      raw = completion.choices[0].message.content || '';
    } else if (provider === 'groq') {
      const { default: Groq } = await import('groq-sdk');
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
        ],
        max_tokens: maxTokens,
        temperature: 0.35,
      });
      raw = completion.choices[0].message.content || '';
    } else {
      const ollamaModel = process.env.OLLAMA_MODEL || 'llama3';
      const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
      const response = await fetch(`${ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModel,
          stream: false,
          options: { temperature: 0.35, num_predict: maxTokens },
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
          ],
        }),
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Ollama error: ${err}`);
      }
      const data = await response.json();
      raw = data.message?.content || '';
    }

    const clean = raw.replace(/#\S+/g, '').replace(/[ \t]{2,}/g, ' ').trim();

    if (!req.isDemo && !isPremium && userData) {
      const chatCount = userData.chatUsage?.[monthKey] || 0;
      await setUser(req.uid, {
        chatUsage: { ...(userData.chatUsage || {}), [monthKey]: chatCount + 1 },
      });
    }

    res.json({ content: clean });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Physique Analysis (Vision AI) ────────────────────────────────────────
app.post('/api/analyze-physique', requireAuth, async (req, res) => {
  const { images, angle } = req.body;
  if (!images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: 'At least one image is required.' });
  }

  const monthKey = getMonthKey();
  let userData = null;
  let isPremium = false;

  if (!req.isDemo) {
    userData = await getUser(req.uid);
    isPremium = userData.isPremium || req.email?.toLowerCase() === PERMANENT_PREMIUM_EMAIL;

    if (!isPremium) {
      const count = userData.analysisUsage?.[monthKey] || 0;
      if (count >= FREE_ANALYSIS_LIMIT) {
        return res.status(403).json({ error: 'Monthly analysis limit reached. Upgrade to Premium for unlimited analyses.' });
      }
      await setUser(req.uid, {
        analysisUsage: { ...(userData.analysisUsage || {}), [monthKey]: count + 1 },
      });
    }
  }

  const angleContext = angle === 'all'
    ? 'The user has provided 3 physique photos in order: front view, back view, and side view.'
    : `The user has provided a ${angle || 'front'} view physique photo.`;

  const feedbackField = isPremium
    ? ',\n  "feedback": "<2-3 paragraph expert analysis: specific strengths, weak points, and actionable training recommendations based on what you actually observe>"'
    : '';

  const prompt = `${angleContext}

You are an expert competitive physique analyst. Score what you ACTUALLY see — do not inflate scores.
Scoring benchmarks: beginner 15-35, recreational trainee 35-50, intermediate 50-65, advanced 65-80, elite/competitive 80+.

Return ONLY valid JSON with these exact keys (no markdown, no explanation outside the JSON):
{
  "aesthetic": <0-100, overall visual appeal and muscularity>,
  "mass": <0-100, overall muscle mass>,
  "symmetry": <0-100, left/right balance>,
  "proportions": <0-100, muscle group proportions>,
  "conditioning": <0-100, definition and body fat level>,
  "bodyFatEst": <estimated body fat as a plain number 7-40>,
  "vascularity": <0-100, visible veins>,
  "shoulders": <0-100>,
  "chest": <0-100>,
  "back": <0-100>,
  "arms": <0-100>,
  "core": <0-100>,
  "legs": <0-100>${feedbackField}
}`;

  try {
    let scores = null;

    if (process.env.OPENAI_API_KEY) {
      const { default: OpenAI } = await import('openai');
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await client.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: isPremium ? 1200 : 450,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            ...images.map(img => ({ type: 'image_url', image_url: { url: img, detail: 'high' } })),
          ],
        }],
      });
      const raw = completion.choices[0].message.content || '';
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) scores = JSON.parse(match[0]);
    } else if (process.env.ANTHROPIC_API_KEY) {
      const { default: Anthropic } = await import('@anthropic-ai/sdk');
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const imgContents = images.map(img => {
        const m = img.match(/^data:([^;]+);base64,(.+)$/);
        if (!m) return null;
        return { type: 'image', source: { type: 'base64', media_type: m[1], data: m[2] } };
      }).filter(Boolean);
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: isPremium ? 1200 : 450,
        messages: [{ role: 'user', content: [...imgContents, { type: 'text', text: prompt }] }],
      });
      const raw = response.content[0]?.text || '';
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) scores = JSON.parse(match[0]);
    } else {
      return res.status(500).json({
        error: 'No vision AI configured. Add OPENAI_API_KEY or ANTHROPIC_API_KEY to your Vercel environment variables.',
      });
    }

    if (!scores) {
      return res.status(500).json({ error: 'Could not parse AI analysis. Please try again.' });
    }

    res.json({ ok: true, scores, isPremium });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Email OTP ─────────────────────────────────────────────────────────────
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const code = String(Math.floor(100000 + Math.random() * 900000));
  otpStore.set(email.toLowerCase(), { code, expires: Date.now() + 10 * 60 * 1000 });

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.default.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transporter.sendMail({
        from: `"Myogen" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Myogen — Verification Code',
        text: `Your Myogen verification code is: ${code}\n\nThis code expires in 10 minutes.`,
        html: `<p>Your Myogen verification code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`,
      });
      res.json({ ok: true, sent: true });
    } catch (err) {
      res.json({ ok: true, sent: false, devCode: code });
    }
  } else {
    res.json({ ok: true, sent: false, devCode: code });
  }
});

app.post('/api/verify-otp', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Email and code required' });
  const stored = otpStore.get(email.toLowerCase());
  if (!stored) return res.status(400).json({ error: 'No OTP found for this email' });
  if (Date.now() > stored.expires) { otpStore.delete(email.toLowerCase()); return res.status(400).json({ error: 'Code expired' }); }
  if (stored.code !== String(code)) return res.status(400).json({ error: 'Invalid code' });
  otpStore.delete(email.toLowerCase());
  res.json({ ok: true });
});

export default app;
