import { Ratelimit } from '@upstash/ratelimit'
import { redis } from './redis.js'

export const chatRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(40, '1 h'),
  prefix: 'rl:chat',
})

export const globalRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1 m'),
  prefix: 'rl:global',
})
