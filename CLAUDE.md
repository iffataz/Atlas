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

Atlas is a voice-assisted grocery search app. The user speaks a list of grocery items, says "done", and the app searches MongoDB for matching products.

**Request flow:**
1. `VoiceRecorder` (Web Speech API) captures speech, extracts items before "done", deduplicates
2. Sends `{ terms: string[] }` to `POST /api/search`
3. Route runs one Atlas Search aggregation per term (up to 5 results each), returns grouped results
4. `app/page.tsx` renders results grouped by term using `ProductCard`

**Key constraints:**
- Web Speech API only works in Chrome/Edge — not Firefox/Safari
- API routes that use Mongoose **must** export `export const runtime = "nodejs"`
- `next.config.mjs` only — Next.js 14 does not support `next.config.ts`
- MongoDB connection is cached on `global` to survive serverless warm restarts (`lib/mongodb.ts`)

## Database

- **Collection:** `vic_catalog_nodupe`
- **Atlas Search index:** `nodupecatalog` (wildcard paths, must exist in Atlas dashboard)
- **Model:** `lib/models/Product.ts` — 18 fields including `Product_Name`, `Brand`, `Package_price`, `Price_per_unit`, `package_size`, `Product_Url`, `is_special`
- **Environment:** `MONGODB_URI` in `.env.local` (gitignored), also set in Vercel dashboard

## Styling

Tailwind with one custom token: `atlas` = `#7447ae` (purple). Content paths cover `app/` and `components/` only.

## Deployment

```bash
npm run build          # Verify clean build first
npx vercel --prod      # Deploy to Vercel
```

Set `MONGODB_URI` in the Vercel project environment variables (Production + Preview).
