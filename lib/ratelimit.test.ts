import { describe, it, expect } from "vitest";
import { limitLlmCall } from "./ratelimit";

// No Upstash env vars in tests, so this exercises the in-memory fallback.
describe("limitLlmCall", () => {
  it("allows 10 calls per owner per hour", async () => {
    for (let i = 0; i < 10; i++) {
      expect((await limitLlmCall("owner-a", "10.0.0.1")).success).toBe(true);
    }
    const blocked = await limitLlmCall("owner-a", "10.0.0.1");
    expect(blocked.success).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("caps an IP even when every request has a fresh owner id", async () => {
    for (let i = 0; i < 30; i++) {
      expect((await limitLlmCall(`fresh-${i}`, "10.0.0.2")).success).toBe(true);
    }
    expect((await limitLlmCall("fresh-30", "10.0.0.2")).success).toBe(false);
  });
});
