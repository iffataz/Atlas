import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Every request to /api/plan POST and /api/plan/[id] POST costs a paid Groq
// call, so both share this one budget per owner.
const LIMIT = 10;
const WINDOW_MS = 60 * 60 * 1000;

// Durable limiting needs Upstash (Vercel instances don't share memory).
// Without the env vars we degrade to a per-instance sliding window: correct
// in local dev, best-effort in production.
const upstash =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(LIMIT, "1 h"),
        prefix: "atlas:llm",
      })
    : null;

const memory = new Map<string, number[]>();

export interface RateLimitResult {
  success: boolean;
  retryAfterSeconds: number;
}

export async function limitLlmCall(key: string): Promise<RateLimitResult> {
  if (upstash) {
    const { success, reset } = await upstash.limit(key);
    return {
      success,
      retryAfterSeconds: Math.max(0, Math.ceil((reset - Date.now()) / 1000)),
    };
  }

  const now = Date.now();
  if (memory.size > 500) {
    memory.forEach((hits, k) => {
      if (hits.every((t) => now - t >= WINDOW_MS)) memory.delete(k);
    });
  }

  const hits = (memory.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= LIMIT) {
    memory.set(key, hits);
    return {
      success: false,
      retryAfterSeconds: Math.ceil((WINDOW_MS - (now - hits[0])) / 1000),
    };
  }
  hits.push(now);
  memory.set(key, hits);
  return { success: true, retryAfterSeconds: 0 };
}
