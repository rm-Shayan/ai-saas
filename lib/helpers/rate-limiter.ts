import { redis } from "@lib/db-config/db"; // tumhara Upstash redis client


interface RateLimiterOptions {
  keyPrefix?: string; // optional prefix for Redis key
  limit: number; // max requests
  ttl: number;   // in seconds
}

/**
 * rateLimiter checks if request exceeds the limit
 * @param key unique identifier (IP / user ID / etc.)
 * @param options limit & ttl
 * @returns boolean (true = allowed, false = blocked)
 */
export async function rateLimiter(key: string, options: RateLimiterOptions) {
  const { limit, ttl, keyPrefix = "rl:" } = options;

  const redisKey = `${keyPrefix}${key}`;

  // increment counter
  const current = await redis.incr(redisKey);

  if (current === 1) {
    // first request, set TTL
    await redis.expire(redisKey, ttl);
  }

  const remaining = limit - current;

  return {
    allowed: current <= limit,
    remaining: remaining < 0 ? 0 : remaining,
    reset: await redis.ttl(redisKey), // seconds left
  };
}
