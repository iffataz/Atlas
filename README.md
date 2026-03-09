# Atlas

Atlas is a voice-assisted grocery assistant. Speak a list of grocery items, say "done", and Atlas returns clickable product cards with prices from Coles.

## Inspiration

Atlas was inspired by the desire to revolutionize the grocery shopping experience — making it convenient and accessible for everyone, including those with disabilities.

## What it does

Say each grocery item aloud, then say "done". Atlas searches a product catalogue and displays matching results with name, brand, size, price, and a direct link to the product page.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: MongoDB Atlas (Atlas Search, `nodupecatalog` index)
- **Deployment**: Vercel

## Project Structure

```
app/
  layout.tsx          # Root layout
  page.tsx            # Hero + voice widget + results
  globals.css         # Tailwind base
  api/search/
    route.ts          # POST /api/search
components/
  VoiceRecorder.tsx   # Web Speech API client component
  ProductCard.tsx     # Product display card
lib/
  mongodb.ts          # Cached Mongoose connection
  models/Product.ts   # Mongoose schema
public/
  ATLAS_final.png
  github.png
```

## Requirements

- Node.js 18+
- A MongoDB Atlas cluster with:
  - Collection: `vic_catalog_nodupe`
  - Atlas Search index named `nodupecatalog` (wildcard text search)

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` with your connection string:
   ```
   MONGODB_URI=mongodb+srv://USER:PASSWORD@HOST/DATABASE?retryWrites=true&w=majority
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in Chrome (Web Speech API requires Chrome or Edge).

## Deploy to Vercel

```bash
npx vercel --prod
```

Then go to **Settings → Environment Variables** in the Vercel dashboard and add `MONGODB_URI`.

## Notes

- Speech recognition requires Chrome or Edge (Web Speech API).
- The `$search` stage uses the `nodupecatalog` Atlas Search index with wildcard path matching.
