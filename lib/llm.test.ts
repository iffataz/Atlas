import { describe, it, expect } from "vitest";
import { APIError } from "groq-sdk";
import { translateGroqError, LlmBusyError, LlmResponseError } from "./llm";

const apiError = (status: number, code: string) =>
  APIError.generate(status, { error: { message: "x", code } }, undefined, new Headers());

describe("translateGroqError", () => {
  it("maps Groq's per-minute token limit (413/429) to LlmBusyError", () => {
    expect(translateGroqError(apiError(413, "rate_limit_exceeded"))).toBeInstanceOf(LlmBusyError);
    expect(translateGroqError(apiError(429, "rate_limit_exceeded"))).toBeInstanceOf(LlmBusyError);
  });

  it("maps Groq's malformed-JSON rejection to LlmResponseError (retryable)", () => {
    expect(translateGroqError(apiError(400, "json_validate_failed"))).toBeInstanceOf(LlmResponseError);
  });

  it("passes other errors through unchanged", () => {
    const auth = apiError(401, "invalid_api_key");
    expect(translateGroqError(auth)).toBe(auth);
    const plain = new Error("network");
    expect(translateGroqError(plain)).toBe(plain);
  });
});
