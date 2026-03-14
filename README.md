# Atlas

Atlas is a voice-assisted AI meal planning app. Describe your dietary preferences and Atlas generates a full 7-day meal plan with breakfast, lunch, and dinner — plus an aggregated shopping list. Refine the plan by voice at any time.

## Inspiration

Atlas was inspired by the desire to make meal planning effortless and accessible for everyone, including those with disabilities.

## What it does

1. Choose your serving size and tap **Plan my week**.
2. Speak your dietary preferences, cuisine tastes, and any restrictions.
3. Atlas generates a 7-day meal plan via Groq (Llama 4 Scout) and displays it as a card grid.
4. Switch to the **Shopping List** tab to see every ingredient aggregated and sorted by category.
5. Tap **Refine your plan** and say what to change — Atlas updates the plan in place.
6. Browse and reload past plans from your history.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **LLM**: Groq API (Llama 4 Scout) via `groq-sdk`
- **Database**: MongoDB Atlas + Mongoose
- **Deployment**: Vercel

## Project Structure

```
app/
  layout.tsx              # Root layout
  page.tsx                # Hero + voice widget + plan/shopping tabs
  globals.css             # Tailwind base
  api/
    health/route.ts       # GET /api/health — DB diagnostics
    plan/route.ts         # POST /api/plan — generate plan; GET — list history
    plan/[id]/route.ts    # GET — fetch plan; POST — refine plan
components/
  VoiceRecorder.tsx       # Web Speech API client component
  MealPlanGrid.tsx        # 7-day meal plan card grid
  ShoppingList.tsx        # Aggregated ingredient list by category
  PlanHistory.tsx         # Browse and reload saved plans
lib/
  mongodb.ts              # Cached Mongoose connection
  llm.ts                  # Groq client, prompts, JSON schema
  aggregateIngredients.ts # Normalize + merge ingredients into shopping list
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

2. Create `.env.local` with your credentials:
   ```
   MONGODB_URI=mongodb+srv://USER:PASSWORD@HOST/DATABASE?retryWrites=true&w=majority
   GROQ_API_KEY=gsk_...
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in Chrome or Edge (Web Speech API required).

## Deploy to Vercel

```bash
npm run build
npx vercel --prod
```

Then add `MONGODB_URI` and `GROQ_API_KEY` in **Settings > Environment Variables** in the Vercel dashboard.

## Notes

- Speech recognition requires Chrome or Edge (Web Speech API).
- Plan generation takes roughly 10–15 seconds depending on Groq latency.
- Plans are persisted in MongoDB and can be reloaded from the history panel.
