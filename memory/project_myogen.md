---
name: Myogen Project
description: Science-based fitness SaaS — confirmed tech stack and architecture
type: project
---

Myogen is a science-based fitness SaaS (React + Vite, dark space theme).

**Confirmed tech stack:**
- Frontend: React + Vite, deployed on Vercel
- Backend: Firebase only (Auth, Firestore/Realtime Database, Analytics, Hosting)
- AI: Groq (LLaMA 70B, free tier)
- Payments: PayPal

**NOT used:** Supabase, Render — user confirmed Firebase is the only backend.

**Why:** User clarified during firebase init setup (April 2026).

**How to apply:** All auth and data storage must use Firebase SDK. Any Supabase code in the codebase is legacy and needs to be replaced with Firebase equivalents before production.
