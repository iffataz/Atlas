# Atlas — Code Walkthrough

How a request travels from the microphone to MongoDB and back, and which file does what. Line links point at the code as of the last update to this doc; if they drift, search for the named function.

## The big picture

```
Browser (app/page.tsx)                Server (Next.js API routes)            External
──────────────────────                ───────────────────────────            ────────
VoiceRecorder → text      ──POST──▶   /api/plan
                                        1. who is this? (cookie)
                                        2. rate limit check
                                        3. validate input (zod)
                                        4. build prompt ─────────────────▶   Groq (gpt-oss-120b)
                                        5. validate LLM JSON (zod) ◀──────
                                        6. aggregate shopping list
                                        7. save ─────────────────────────▶   MongoDB
MealPlanGrid + ShoppingList ◀──JSON──   8. return plan
```

One page, three API routes, and a `lib/` of focused helpers.

## 1. Frontend — a single page driven by a state machine

[`app/page.tsx`](../app/page.tsx) is the only page. Everything hangs off one piece of state ([L15](../app/page.tsx#L15)):

```ts
type AppState = "idle" | "generating" | "refining" | "ready";
```

Instead of separate `isLoading` / `isError` booleans, each state renders a different UI, so impossible combinations (generating *and* refining) can't exist.

**Voice input** — [`components/VoiceRecorder.tsx`](../components/VoiceRecorder.tsx)
- Uses the browser's built-in Web Speech API — no paid speech service ([`startListening`, L43](../components/VoiceRecorder.tsx#L43)).
- The transcript lands in an **editable textarea** rather than submitting immediately ([L66](../components/VoiceRecorder.tsx#L66)) — the user can fix a mis-hearing before it costs an LLM call.
- The same textarea is the fallback for Firefox/Safari, which have no speech support.
- [`submitText()`, L107](../components/VoiceRecorder.tsx#L107) is the single hand-off to the parent.

**Sending the request** — [`handlePreferences`, L56](../app/page.tsx#L56) POSTs `{ preferences, servings }` to `/api/plan`. Two guards:
- `inFlightRef` ([L35](../app/page.tsx#L35)) blocks double-submits, so a double click can't trigger two paid Groq calls.
- An `AbortController` cancels in-flight requests on "Start over" ([L206](../app/page.tsx#L206)), so a late response can't overwrite a screen the user left.

## 2. The API route — `POST /api/plan`

[`app/api/plan/route.ts`](../app/api/plan/route.ts) is a linear pipeline:

1. **Identify the browser** — [`lib/owner.ts`](../lib/owner.ts#L16). No login: the first visit gets a random UUID in an httpOnly cookie (`atlas_uid`). Plans are tagged with it, which is why history is private per browser.
2. **Rate limit** — [`lib/ratelimit.ts`](../lib/ratelimit.ts). 10 LLM calls/hour per owner and 30/hour per client IP, shared across all LLM routes. The IP budget exists because the owner cookie alone is bypassable: a client that never sends it gets a fresh owner id every request. Uses Upstash Redis if configured, else an in-memory sliding window — fine locally, best-effort on Vercel since instances don't share memory.
3. **Validate input** — `PreferencesInputSchema` in [`lib/schemas.ts`](../lib/schemas.ts#L44): trims, requires non-empty, truncates to 500 chars, clamps servings to 1–20.
4. **Call the LLM** — see §3.
5. **Validate the LLM output** — `MealPlanDaysSchema` ([L36](../lib/schemas.ts#L36)) demands exactly 7 days × 3 meals.
6. **Aggregate the shopping list** — see §4.
7. **Save** with `MealPlan.create(...)` and return the plan.

Errors are split deliberately: a bad LLM response → **502** ("try again"), anything else → **500**. Everything is logged with a tag and timestamp via [`lib/log.ts`](../lib/log.ts).

## 3. The LLM layer — `lib/llm.ts`

[`lib/llm.ts`](../lib/llm.ts)

- **Structured output.** The request includes a JSON Schema ([L15–61](../lib/llm.ts#L15)), so Groq constrains the model to the plan's shape instead of free text. Categories are an enum (`Produce`, `Proteins`, …) — that's what makes the shopping list groupable.
- **Prompt-injection defence.** User text is wrapped in `<user_preferences>` tags and the prompt says to treat it as data, never instructions ([L176](../lib/llm.ts#L176)).
- **Two retry layers** in [`callGroq`, L67](../lib/llm.ts#L67): the SDK retries network/5xx errors; a loop retries once more if the model returns empty or malformed JSON (`LlmResponseError`).
- **Lazy client** ([L5](../lib/llm.ts#L5)). The Groq client is created on first use, so `npm run build` doesn't fail without an API key.
- **Three entry points, one helper:**
  - `generateMealPlan` — full week.
  - `refineMealPlan` ([L111](../lib/llm.ts#L111)) — sends only meal names/descriptions, not ingredients, cutting the prompt to roughly a third.
  - `regenerateMeal` ([L135](../lib/llm.ts#L135)) — single meal, smaller schema.

**Why validate twice?** The JSON Schema *asks* for a shape; zod *verifies* what came back. Zod is forgiving where it's safe — an unknown category becomes `"Other"` ([schemas.ts L20](../lib/schemas.ts#L20)), `"2"` is coerced to `2` — and strict where it matters (a missing day fails).

## 4. Shopping list — `lib/aggregateIngredients.ts`

[`lib/aggregateIngredients.ts`](../lib/aggregateIngredients.ts) is pure, deterministic code — no AI:

1. Flatten all 21 meals' ingredients.
2. Convert cooking units (cup/tbsp/tsp) to metric so they can be summed ([`lib/unitConversion.ts`](../lib/unitConversion.ts)).
3. Normalize names ([`normalizeName`](../lib/aggregateIngredients.ts)): `"Tomatoes"` → `"tomato"`, via an irregulars table plus a trailing-`s` rule that skips `-ss` and `-us` words (hummus, couscous). Unit aliases fold too (`whole` → `piece`, `cloves` → `clove`).
4. Group by `name + unit` and sum quantities.
5. Round for shopping (1500 g → 1.5 kg; under 50 ml/g to whole units so ¼ tsp salt isn't "0 ml"; count units round up), then sort by category, then name.

## 5. Modifying a plan

| Action | Route | What happens |
|---|---|---|
| Voice refine | `POST /api/plan/[id]` ([route](../app/api/plan/%5Bid%5D/route.ts)) | LLM returns all 7 days; re-validated, list re-aggregated, saved |
| Servings change | `PATCH /api/plan/[id]` | Quantities rescaled arithmetically ([`lib/scalePlan.ts`](../lib/scalePlan.ts)) — no LLM call, no rate limit |
| Swap one meal | `POST /api/plan/[id]/meal` ([route](../app/api/plan/%5Bid%5D/meal/route.ts)) | LLM returns one meal, patched in via `plan.set("days.2.dinner", …)` ([L74](../app/api/plan/%5Bid%5D/meal/route.ts#L74)) |
| Delete | `DELETE /api/plan/[id]` ([route](../app/api/plan/%5Bid%5D/route.ts#L107)) | Only if the cookie owns the plan |
| Load one plan | `GET /api/plan/[id]` | Returns the plan unless another owner has it |
| History | `GET /api/plan` | Owner's plans, newest first, paginated |
| Share | `POST /api/plan/[id]/share` | Creates (once) a random `shareId` token for the owner's plan |
| View shared plan | `GET /api/share/[shareId]` | Read-only plan for anyone with the link; never returns `_id`/`ownerId` |

Details:
- **Servings change is arithmetic, not a refine.** `handleServingsChange` in `app/page.tsx` PATCHes the new count; quantities keep 6 decimals so scaling back and forth doesn't drift, and the UI rounds for display.
- **Optimistic UI** — the servings dropdown updates immediately and rolls back if the request fails.
- **URL state** — the open plan is mirrored into the address bar (`?plan=<id>` for your own, `?share=<token>` for a shared one), so a refresh or bookmark reopens it. Shared plans render read-only: no refine, swap, servings or share controls.
- **Share tokens, not ids** — share links use a random 128-bit `shareId` rather than the ObjectId, because ObjectIds are partly sequential and guessable from a neighbour.
- **No existence leaks** — someone else's plan returns **404, not 403** ([`ownedBySomeoneElse`, L16](../app/api/plan/%5Bid%5D/route.ts#L16)). Legacy plans without an `ownerId` stay viewable by link but can't be deleted.
- **Mongoose gotcha** — the swap route calls `.toObject()` before aggregating ([L77](../app/api/plan/%5Bid%5D/meal/route.ts#L77)), because spreading a Mongoose subdocument silently drops its getter-backed fields.

## 6. Data & infrastructure

- **Model** — [`lib/models/MealPlan.ts`](../lib/models/MealPlan.ts): one document per plan, fully nested (plan → days → meals → ingredients, plus `shoppingList`). Plans are always read and written whole, so no joins.
- **Indexes** — `{ ownerId: 1, createdAt: -1 }` matches the history query exactly ("my plans, newest first"); a sparse unique `{ shareId: 1 }` serves share links.
- **Connection caching** — [`lib/mongodb.ts`](../lib/mongodb.ts) stores the connection on `global` so warm serverless invocations on Vercel reuse it.
- **Mongoose routes** must export `runtime = "nodejs"` (Mongoose doesn't run on the Edge runtime).
- **History UI** — [`components/PlanHistory.tsx`](../components/PlanHistory.tsx#L30) calls `GET /api/plan`; the route fetches `limit + 1` rows to know whether older plans exist.
- **Shopping checkboxes** persist in `localStorage` per plan ([`ShoppingList.tsx` L23](../components/ShoppingList.tsx#L23)) — purely client-side.

## FAQ

- **Why Groq?** Latency — a full 7-day, 21-meal plan comes back in roughly 10–20 seconds.
- **What if the AI returns nonsense?** Three layers: schema-constrained output, a retry on unparseable JSON, and zod validation before anything is saved.
- **Is there auth?** No — anonymous per-browser cookies. A plan is only visible to the browser that made it, unless its owner shares it, which creates a read-only link. Legacy plans from before ownership existed stay viewable by id.
- **How is abuse limited?** Per-owner and per-IP rate limiting, 500-char input cap, and prompt-injection delimiters.
- **What's tested?** `npm run test` covers the zod schemas, the Mongoose model, LLM error mapping, plan scaling, shopping-list aggregation, unit rounding and the in-memory rate limiter. CI (`.github/workflows/ci.yml`) runs type check, lint, tests and build on every PR. API and UI are verified manually.
