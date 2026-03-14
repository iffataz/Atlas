# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server on localhost:3000
npm run build    # Production build (must pass with zero type errors)
npm run lint     # ESLint via Next.js
npm run start    # Start production server
```

No test framework is configured. Verify changes manually via the browser and `/api/health`.

## Architecture

Atlas is a voice-assisted AI meal planning app. The user speaks dietary preferences, and Atlas generates a 7-day meal plan with an aggregated shopping list. Plans can be refined by voice and are persisted in MongoDB.

**Request flow:**
1. `VoiceRecorder` (Web Speech API) captures speech preferences
2. `app/page.tsx` sends `{ preferences, servings }` to `POST /api/plan`
3. Route calls Groq (Llama 4 Scout) via `lib/llm.ts` to generate a structured 7-day plan
4. `lib/aggregateIngredients.ts` merges all ingredients into a shopping list
5. Plan + shopping list are saved to MongoDB (`meal_plans` collection) and returned
6. `MealPlanGrid` renders meals; `ShoppingList` renders ingredients by category
7. Refinement sends `{ instruction }` to `POST /api/plan/[id]`, which re-generates with the existing plan as context

**Key constraints:**
- Web Speech API only works in Chrome/Edge — not Firefox/Safari
- API routes that use Mongoose **must** export `export const runtime = "nodejs"`
- `next.config.mjs` only — Next.js 14 does not support `next.config.ts`
- MongoDB connection is cached on `global` to survive serverless warm restarts (`lib/mongodb.ts`)
- Groq client is lazy-initialized in `lib/llm.ts` to avoid build-time errors

## Database

- **Collection:** `meal_plans`
- **Model:** `lib/models/MealPlan.ts` — preferences, servings, days (7 × 3 meals with ingredients), shoppingList
- **Environment:** `MONGODB_URI` and `GROQ_API_KEY` in `.env.local` (gitignored), also set in Vercel dashboard

## Styling

Tailwind with one custom token: `atlas` = `#7447ae` (purple). Content paths cover `app/` and `components/` only.

## Deployment

```bash
npm run build          # Verify clean build first
npx vercel --prod      # Deploy to Vercel
```

Set `MONGODB_URI` and `GROQ_API_KEY` in the Vercel project environment variables (Production + Preview).
