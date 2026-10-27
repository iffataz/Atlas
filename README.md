# Atlas

Atlas is a voice-assisted AI meal planning app. Describe your dietary preferences and Atlas generates a full 7-day meal plan with breakfast, lunch, and dinner — plus an aggregated shopping list. Refine the plan by voice at any time.

## Inspiration

Atlas was inspired by the desire to make meal planning effortless and accessible for everyone, including those with disabilities.

## What it does

1. Choose your serving size and tap **Plan my week**.
2. Speak your dietary preferences, cuisine tastes, and any restrictions.
3. Atlas generates a 7-day meal plan via Groq (GPT-OSS 120B) and displays it as a card grid.
4. Switch to the **Shopping List** tab to see every ingredient aggregated and sorted by category.
5. Tap **Refine your plan** and say what to change — Atlas updates the plan in place. Swap a single meal, or change servings to rescale every quantity instantly.
6. Tap **Share plan** to copy a read-only link anyone can open.
7. Browse and reload past plans from your history; refreshing the page keeps the plan you're on.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **LLM**: Groq API (GPT-OSS 120B) via `groq-sdk`
- **Database**: MongoDB Atlas + Mongoose
- **Deployment**: Vercel

For a walkthrough of how the code fits together, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Project Structure

```
app/
  layout.tsx              # Root layout
  page.tsx                # Hero + voice widget + plan/shopping tabs
  globals.css             # Tailwind base
  api/
    health/route.ts       # GET /api/health — DB diagnostics
    plan/route.ts         # POST /api/plan — generate plan; GET — list history
    plan/[id]/route.ts    # GET — fetch; POST — refine; PATCH — rescale servings; DELETE
    plan/[id]/meal/route.ts   # POST — swap one meal
    plan/[id]/share/route.ts  # POST — create read-only share token
    share/[shareId]/route.ts  # GET — read-only shared plan
components/
  VoiceRecorder.tsx       # Web Speech API client component
  MealPlanGrid.tsx        # 7-day meal plan card grid
  ShoppingList.tsx        # Aggregated ingredient list by category
  PlanHistory.tsx         # Browse and reload saved plans
lib/
  mongodb.ts              # Cached Mongoose connection
  llm.ts                  # Groq client, prompts, JSON schema
  schemas.ts              # zod validation for requests and LLM output
  aggregateIngredients.ts # Normalize + merge ingredients into shopping list
  unitConversion.ts       # Cooking units -> metric, shopping rounding
  scalePlan.ts            # Rescale quantities for a new serving size
  owner.ts                # Anonymous per-browser owner cookie
  ratelimit.ts            # Per-owner + per-IP limits on LLM calls
  log.ts                  # Tagged server-side error logging
  models/MealPlan.ts      # Mongoose schema (meal_plans collection)
public/
  ATLAS_final.png         # Hero background
  github.png              # GitHub icon
```

## Requirements

- Node.js 18+
- A MongoDB Atlas cluster (any collection name — the app uses `meal_plans`)
- A Groq API key ([console.groq.com](https://console.groq.com))

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in your credentials:
   ```
   MONGODB_URI=mongodb+srv://USER:PASSWORD@HOST/DATABASE?retryWrites=true&w=majority
   GROQ_API_KEY=gsk_...
   # optional, for rate limits shared across serverless instances:
   UPSTASH_REDIS_REST_URL=...
   UPSTASH_REDIS_REST_TOKEN=...
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000`. Voice input needs Chrome or Edge (Web Speech API); other browsers get a text box.

5. Checks (also run in CI on every PR):
   ```bash
   npx tsc --noEmit && npm run lint && npm test
   ```

## Deploy to Vercel

```bash
npm run build
npx vercel --prod
```

Then add `MONGODB_URI` and `GROQ_API_KEY` (plus optionally the Upstash vars) in **Settings > Environment Variables** in the Vercel dashboard.

## Notes

- Speech recognition requires Chrome or Edge (Web Speech API); typing works everywhere.
- Plan generation takes roughly 10–15 seconds depending on Groq latency.
- Plans are persisted in MongoDB and can be reloaded from the history panel.
