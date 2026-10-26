import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";

// Every request to /api/plan, /api/plan/[id] and /api/plan/[id]/meal POST costs a paid Groq
// call, so all three share this one budget per owner.
const OWNER_LIMIT = 10;
// The owner cookie alone is trivially bypassed (a client that never sends it
// gets a fresh id each request), so each IP also has a budget. It's higher
// than the owner limit because several people can share one IP (office, NAT).
const IP_LIMIT = 30;
const WINDOW_MS = 60 * 60 * 1000;

// Durable limiting needs Upstash (Vercel instances don't share memory).
// Without the env vars we degrade to a per-instance sliding window: correct
// in local dev, best-effort in production.
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;
const upstashOwner = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(OWNER_LIMIT, "1 h"),
      prefix: "atlas:llm",
    })
  : null;
const upstashIp = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(IP_LIMIT, "1 h"),
      prefix: "atlas:llm-ip",
    })
  : null;

const memory = new Map<string, number[]>();

export interface RateLimitResult {
  success: boolean;
  retryAfterSeconds: number;
}

function limitInMemory(key: string, limit: number): RateLimitResult {
  const now = Date.now();
  if (memory.size > 500) {
    memory.forEach((hits, k) => {
      if (hits.every((t) => now - t >= WINDOW_MS)) memory.delete(k);
    });
  }

  const hits = (memory.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= limit) {
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

async function limitKey(
  upstash: Ratelimit | null,
  key: string,
  limit: number
): Promise<RateLimitResult> {
  if (upstash) {
    const { success, reset } = await upstash.limit(key);
    return {
      success,
      retryAfterSeconds: Math.max(0, Math.ceil((reset - Date.now()) / 1000)),
    };
  }
  return limitInMemory(key, limit);
}

// Vercel sets x-forwarded-for itself (client-supplied values are overwritten),
// so its first entry is the real client IP there.
export function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("x-real-ip") || req.ip || "unknown";
}

export async function limitLlmCall(
  ownerId: string,
  ip: string
): Promise<RateLimitResult> {
  // IP first: a cookie-less client must not get past it by minting owners.
  const byIp = await limitKey(upstashIp, `ip:${ip}`, IP_LIMIT);
  if (!byIp.success) return byIp;
  return limitKey(upstashOwner, ownerId, OWNER_LIMIT);
}
