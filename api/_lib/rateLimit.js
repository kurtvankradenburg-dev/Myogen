import { Ratelimit } from '@upstash/ratelimit'
import { redis } from './redis.js'

// No-op limiter when Redis is not configured
const noopLimiter = { limit: async () => ({ success: true }) }

export const chatRatelimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(40, '1 h'), prefix: 'rl:chat' })
  : noopLimiter

export const globalRatelimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, '1 m'), prefix: 'rl:global' })
  : noopLimiter
