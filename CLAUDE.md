# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server on localhost:3000
npm run build    # Production build (must pass with zero type errors)
npm run lint     # ESLint via Next.js
npm run test     # Vitest unit tests (lib/schemas.test.ts)
npm run start    # Start production server
```

Unit tests cover the zod schemas only; verify API/UI changes manually via the browser and `/api/health`. Never run `npm run build` while the dev server is running — both write to `.next` and corrupt the dev cache (use `npx tsc --noEmit` for interim type checks).

## Architecture

Atlas is a voice-assisted AI meal planning app. The user speaks (or types) dietary preferences, and Atlas generates a 7-day meal plan with an aggregated shopping list. Plans can be refined by voice, individual meals swapped, and everything is persisted in MongoDB.

**Request flow:**
1. `VoiceRecorder` captures speech (Web Speech API) into an editable textarea; browsers without speech support get the textarea directly
2. `app/page.tsx` sends `{ preferences, servings }` to `POST /api/plan`
3. Route calls Groq (Llama 4 Scout) via `lib/llm.ts` to generate a structured 7-day plan; the response is validated with zod (`lib/schemas.ts`) before anything is persisted
4. `lib/aggregateIngredients.ts` merges all ingredients into a shopping list
5. Plan + shopping list are saved to MongoDB (`meal_plans` collection) and returned
6. `MealPlanGrid` renders meals; `ShoppingList` renders ingredients by category (checked items persist in localStorage per plan)
7. Refinement sends `{ instruction, servings? }` to `POST /api/plan/[id]`; single-meal swap sends `{ day, mealType }` to `POST /api/plan/[id]/meal`; `DELETE /api/plan/[id]` removes a plan

**Ownership & abuse protection:**
- Plans are scoped to an anonymous httpOnly cookie (`atlas_uid`, set in `lib/owner.ts`) — no real auth; plans are "unlisted", direct links work for anyone with the id
- LLM endpoints share a 10-calls/hour/owner rate limit (`lib/ratelimit.ts`): Upstash if `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` are set, otherwise a per-instance in-memory fallback
- All request bodies and LLM responses are validated with zod schemas in `lib/schemas.ts`; user text is delimiter-wrapped in prompts (`lib/llm.ts`)

**Key constraints:**
- API routes that use Mongoose **must** export `export const runtime = "nodejs"`
- `next.config.mjs` only — Next.js 14 does not support `next.config.ts`
- MongoDB connection is cached on `global` to survive serverless warm restarts (`lib/mongodb.ts`)
- Groq client is lazy-initialized in `lib/llm.ts` to avoid build-time errors
- Don't pass mongoose subdocuments to `aggregateIngredients` — spreading a subdocument drops its getter-backed fields; convert with `.toObject()` first

## Database

- **Collection:** `meal_plans`
- **Model:** `lib/models/MealPlan.ts` — preferences, servings, ownerId, days (7 × 3 meals with ingredients), shoppingList; compound index `{ ownerId: 1, createdAt: -1 }`
- **Environment:** `MONGODB_URI` and `GROQ_API_KEY` in `.env.local` (gitignored), also set in Vercel dashboard; optional `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` for durable rate limiting

## Styling

Tailwind with one custom token: `atlas` = `#7447ae` (purple). Content paths cover `app/` and `components/` only.

## Deployment

```bash
npm run build          # Verify clean build first
npx vercel --prod      # Deploy to Vercel
```

Set `MONGODB_URI` and `GROQ_API_KEY` (plus optionally the Upstash vars) in the Vercel project environment variables (Production + Preview).
