# Atlas Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the Atlas UI — new inline SVG logo, centered dark hero with radial purple bloom, circle mic button, and refined card/tab styles — without touching any logic, API routes, or data models.

**Architecture:** Six focused tasks build up a token system first, then a reusable logo component, then reshape the hero and voice button, and finally tighten the plan/shopping sections. Each task is independently verifiable in the browser via `npm run dev`.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS v3, `next/font/google` (DM Sans + Cormorant Garamond), inline SVG.

## Global Constraints

- Never modify any file under `app/api/`, `lib/`, or `public/` — visual layer only.
- `next.config.mjs` only (not `.ts`). Do not touch it.
- `export const runtime = "nodejs"` must remain in any API route file — do not touch those files.
- No new npm packages. All fonts via `next/font/google`.
- TypeScript must compile with zero errors (`npm run build`).
- All functionality (voice recording, plan generation, plan history, shopping list check/copy) must continue to work.
- Tailwind content paths cover `app/` and `components/` only — don't add new paths.

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `tailwind.config.ts` | Modify | Add color tokens + `breathe` animation |
| `app/layout.tsx` | Modify | Load DM Sans + Cormorant Garamond via CSS variables |
| `components/AtlasLogo.tsx` | **Create** | Inline SVG bowl-arc mark + Cormorant wordmark |
| `app/page.tsx` | Modify | Hero bg, centering, logo, tagline, servings, tabs |
| `components/VoiceRecorder.tsx` | Modify | Circle button with breathing ring; label below |
| `components/MealPlanGrid.tsx` | Modify | Card bg + selected border-only state |
| `components/PlanHistory.tsx` | Modify | Border + hover token updates |
| `components/ShoppingList.tsx` | Modify | Category header sizing |

---

## Task 1: Color tokens + typography foundation

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/layout.tsx`

**Interfaces:**
- Produces: Tailwind color classes `bg-void`, `bg-surface`, `text-ink`, `text-dim`; font CSS variables `--font-dm-sans`, `--font-cormorant`; Tailwind font families `font-sans` (DM Sans), `font-display` (Cormorant); Tailwind animation class `animate-breathe`

- [ ] **Step 1: Update tailwind.config.ts**

Replace the entire file contents with:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        atlas: "#7447ae",
        void: "#0c0c0f",
        surface: "#161619",
        ink: "#f0eef4",
        dim: "#6b7280",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
        display: ["var(--font-cormorant)", "serif"],
      },
      animation: {
        breathe: "breathe 2.5s ease-in-out infinite",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.08)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: Update app/layout.tsx**

Replace the entire file contents with:

```tsx
import type { Metadata } from "next";
import { DM_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  weight: ["300"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Atlas",
  description: "Your AI-powered meal planning assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${cormorant.variable} ${dmSans.className}`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: zero TypeScript errors, zero Tailwind errors. If `Cormorant_Garamond` or `DM_Sans` import fails, check that `next` version supports `next/font/google` (Next.js 13+ does).

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts app/layout.tsx
git commit -m "feat: add color tokens, breathe animation, DM Sans + Cormorant fonts"
```

---

## Task 2: Atlas logo mark component

**Files:**
- Create: `components/AtlasLogo.tsx`

**Interfaces:**
- Consumes: `--font-cormorant` CSS variable (from Task 1 layout.tsx), `font-display` Tailwind class
- Produces: `<AtlasLogo />` — default export, no props. Renders the SVG bowl-arc mark (36×36) and "atlas" wordmark side by side, horizontally centered.

- [ ] **Step 1: Create components/AtlasLogo.tsx**

```tsx
export default function AtlasLogo() {
  return (
    <div className="flex items-center gap-3">
      <svg
        width="36"
        height="32"
        viewBox="0 0 36 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-ink flex-shrink-0"
        aria-hidden="true"
      >
        {/* Bowl: semicircle arc from left to right, opening upward */}
        <path d="M 6 14 A 12 12 0 0 1 30 14" />
        {/* Spoon handle: vertical line from bowl rim center upward */}
        <line x1="18" y1="14" x2="18" y2="4" />
      </svg>
      <span className="font-display font-light tracking-widest text-xl text-ink select-none">
        atlas
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Start dev server and verify logo renders**

```bash
npm run dev
```

Open http://localhost:3000. The logo isn't on the page yet (Task 3 wires it in) — you can temporarily add `<AtlasLogo />` to `app/page.tsx` to preview, then remove it before committing.

- [ ] **Step 3: Commit**

```bash
git add components/AtlasLogo.tsx
git commit -m "feat: add AtlasLogo SVG mark + Cormorant wordmark component"
```

---

## Task 3: Hero section redesign

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `<AtlasLogo />` from `components/AtlasLogo.tsx` (Task 2)
- Consumes: `bg-void`, `text-ink`, `text-dim` color tokens (Task 1)
- Produces: Centered hero with CSS radial bloom, no background image, new tagline, inline servings selector, GitHub link centered at bottom

- [ ] **Step 1: Update the hero section in app/page.tsx**

Find the import block at the top of `app/page.tsx` and add the AtlasLogo import:

```tsx
import AtlasLogo from "@/components/AtlasLogo";
```

- [ ] **Step 2: Replace the hero `<section>` element**

Find this block (lines 117–223 in the original file):
```tsx
{/* Hero */}
<section
  className="relative min-h-screen bg-cover bg-center flex items-center"
  style={{ backgroundImage: "url('/ATLAS_final.png')" }}
>
  <div className="absolute inset-0 bg-black/50" />
  <div className="relative z-10 container mx-auto px-6 flex justify-end">
    <div className="max-w-lg text-right">
      <h1 className="text-5xl font-bold text-white mb-2">
        <span className="text-2xl font-normal block mb-1">Hi, I am</span>
        Atlas.
      </h1>
      <h2 className="text-xl text-gray-200 mb-8">
        Your AI-powered meal planning assistant.
      </h2>

      {appState === "idle" && (
        <div className="flex flex-col items-end gap-4">
          <div className="flex items-center gap-3">
            <label className="text-gray-300 text-sm">Servings:</label>
            <select
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
              className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-atlas"
            >
              {[1, 2, 3, 4, 5, 6, 8].map((n) => (
                <option key={n} value={n} className="bg-gray-900">{n}</option>
              ))}
            </select>
          </div>

          <VoiceRecorder
            onTranscript={handlePreferences}
            status={voiceStatus}
            onStatusChange={setVoiceStatus}
            buttonLabel="Plan my week"
            listeningHint="Describe your dietary needs, cuisine preferences, and any restrictions."
            processingLabel="Generating your meal plan..."
          />

          <p className="text-gray-400 text-sm">
            e.g. &ldquo;I&apos;m vegetarian, love Asian food, keep it budget-friendly&rdquo;
          </p>

          <PlanHistory onSelectPlan={loadPlan} />
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center gap-4 mt-4">
          <div className="flex items-center gap-3 text-white">
            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
              <path className="opacity-75" d="M4 12a8 8 0 018-8v8z" strokeWidth="4" />
            </svg>
            <span className="text-lg">
              {appState === "generating" ? "Creating your meal plan..." : "Updating your plan..."}
            </span>
          </div>
          <p className="text-gray-400 text-sm">This takes about 10–15 seconds.</p>
        </div>
      )}

      {appState === "ready" && plan && (
        <div className="flex flex-col items-end gap-3 mt-2">
          <p className="text-gray-300 text-sm italic">&ldquo;{plan.preferences}&rdquo;</p>
          <VoiceRecorder
            onTranscript={handleRefinement}
            status={voiceStatus}
            onStatusChange={setVoiceStatus}
            buttonLabel="Refine your plan"
            listeningHint="Say what to change, e.g. 'swap Monday dinner for something Thai'."
            processingLabel="Updating your plan..."
          />
          <button
            onClick={handleReset}
            className="text-gray-400 hover:text-white text-sm underline transition-colors"
          >
            Start over
          </button>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm mt-4 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="mt-12 flex justify-end items-center gap-2">
        <span className="text-gray-300 text-sm">Check my code out here</span>
        <a
          href="https://github.com/iffataz/Atlas"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/github.png"
            alt="GitHub"
            width={32}
            height={32}
            className="invert opacity-80 hover:opacity-100 transition-opacity"
          />
        </a>
      </div>
    </div>
  </div>
</section>
```

Replace with:

```tsx
{/* Hero */}
<section className="relative min-h-screen bg-void flex items-center justify-center">
  {/* Radial purple bloom */}
  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      background:
        "radial-gradient(ellipse 70% 55% at 50% 25%, rgba(116,71,174,0.18) 0%, transparent 70%)",
    }}
  />

  <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg w-full py-16">
    <AtlasLogo />

    <p className="text-dim text-base mt-3 mb-10">Your week, spoken once.</p>

    {appState === "idle" && (
      <div className="flex flex-col items-center gap-4 w-full">
        <VoiceRecorder
          onTranscript={handlePreferences}
          status={voiceStatus}
          onStatusChange={setVoiceStatus}
          buttonLabel="Plan my week"
          listeningHint="Describe your dietary needs, cuisine preferences, and any restrictions."
          processingLabel="Generating your meal plan..."
        />

        <select
          value={servings}
          onChange={(e) => setServings(Number(e.target.value))}
          className="bg-transparent text-dim text-sm focus:outline-none cursor-pointer hover:text-ink transition-colors"
        >
          {[1, 2, 3, 4, 5, 6, 8].map((n) => (
            <option key={n} value={n} className="bg-void">
              {n} {n === 1 ? "serving" : "servings"}
            </option>
          ))}
        </select>

        <p className="text-dim text-sm">
          e.g. &ldquo;I&apos;m vegetarian, love Asian food, keep it budget-friendly&rdquo;
        </p>

        <PlanHistory onSelectPlan={loadPlan} />
      </div>
    )}

    {isLoading && (
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-3 text-ink">
          <svg
            className="animate-spin h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
            <path className="opacity-75" d="M4 12a8 8 0 018-8v8z" strokeWidth="4" />
          </svg>
          <span className="text-sm font-medium text-ink">
            {appState === "generating" ? "Creating your meal plan..." : "Updating your plan..."}
          </span>
        </div>
        <p className="text-dim text-xs">This takes about 10–15 seconds.</p>
      </div>
    )}

    {appState === "ready" && plan && (
      <div className="flex flex-col items-center gap-4 mt-2 w-full">
        <p className="text-dim text-sm italic">&ldquo;{plan.preferences}&rdquo;</p>
        <VoiceRecorder
          onTranscript={handleRefinement}
          status={voiceStatus}
          onStatusChange={setVoiceStatus}
          buttonLabel="Refine your plan"
          listeningHint="Say what to change, e.g. 'swap Monday dinner for something Thai'."
          processingLabel="Updating your plan..."
        />
        <button
          onClick={handleReset}
          className="text-dim hover:text-ink text-sm underline transition-colors"
        >
          Start over
        </button>
      </div>
    )}

    {error && (
      <p className="text-red-400 text-sm mt-4 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
        {error}
      </p>
    )}

    <div className="mt-16 flex justify-center items-center gap-2">
      <span className="text-dim text-xs">Check my code out here</span>
      <a
        href="https://github.com/iffataz/Atlas"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src="/github.png"
          alt="GitHub"
          width={28}
          height={28}
          className="invert opacity-50 hover:opacity-80 transition-opacity"
        />
      </a>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Verify in browser**

With `npm run dev` running, open http://localhost:3000. Check:
- No background image — solid dark background with a faint purple glow in the upper center
- AtlasLogo (bowl SVG + "atlas" in serif) centered near top of hero content
- "Your week, spoken once." tagline below logo in muted gray
- Content centered (not right-aligned)
- Voice button renders (will be restyled in Task 4)
- Servings appears as a minimal dropdown, no label
- GitHub link at bottom, centered

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: redesign hero — centered layout, radial bloom bg, logo, new tagline"
```

---

## Task 4: Voice recorder circle button

**Files:**
- Modify: `components/VoiceRecorder.tsx`

**Interfaces:**
- Consumes: `animate-breathe` Tailwind class (Task 1), `text-ink`, `text-dim`, `border-atlas` color classes (Task 1)
- Produces: 64×64px circle button with breathing atlas-purple ring on idle; circle with red dot on listening; spinner centered on processing/refining. Label "Plan my week" / "Refine your plan" appears below the circle, not inside it.

- [ ] **Step 1: Replace components/VoiceRecorder.tsx**

Replace the entire file contents with:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

export type VoiceStatus = "idle" | "listening" | "processing" | "done" | "refining";

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  status: VoiceStatus;
  onStatusChange: (s: VoiceStatus) => void;
  buttonLabel?: string;
  listeningHint?: string;
  processingLabel?: string;
}

export default function VoiceRecorder({
  onTranscript,
  status,
  onStatusChange,
  buttonLabel = "Speak your preferences",
  listeningHint = "Describe your dietary needs, then stop speaking.",
  processingLabel = "Processing...",
}: VoiceRecorderProps) {
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setSpeechAvailable(
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window
    );
  }, []);

  function startListening() {
    if (!speechAvailable) return;

    const SR: any =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    const recognition = new SR();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    let gotResult = false;
    onStatusChange("listening");

    recognition.onresult = (event: any) => {
      const transcript: string = event.results[0][0].transcript.trim();
      if (transcript) {
        gotResult = true;
        onTranscript(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Recognition error:", event.error);
      onStatusChange("idle");
    };

    recognition.onend = () => {
      if (!gotResult) onStatusChange("idle");
    };

    recognition.start();
  }

  function stop() {
    recognitionRef.current?.stop();
  }

  const isActive =
    status === "listening" || status === "processing" || status === "refining";

  return (
    <div className="flex flex-col items-center gap-4">
      {!speechAvailable && (
        <p className="text-red-400 text-sm">
          Speech recognition requires Chrome or Edge.
        </p>
      )}

      {speechAvailable && !isActive && (
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={startListening}
            disabled={status === "done"}
            className="relative w-16 h-16 rounded-full border-2 border-atlas flex items-center justify-center hover:bg-atlas/10 disabled:opacity-40 transition-colors"
          >
            {/* Breathing ring */}
            <span className="absolute inset-0 rounded-full border-2 border-atlas animate-breathe pointer-events-none" />
            <svg
              className="w-6 h-6 text-ink"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v7a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm-7 9h2a5 5 0 0 0 10 0h2a7 7 0 0 1-6 6.92V21h-4v-2.08A7 7 0 0 1 5 12z" />
            </svg>
          </button>
          <span className="text-dim text-sm">{buttonLabel}</span>
        </div>
      )}

      {status === "listening" && (
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full border-2 border-red-500 flex items-center justify-center">
            <span className="animate-pulse w-3 h-3 bg-red-500 rounded-full" />
          </div>
          <p className="text-dim text-sm text-center max-w-xs">{listeningHint}</p>
          <button
            onClick={stop}
            className="text-dim underline text-sm hover:text-ink transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {(status === "processing" || status === "refining") && (
        <div className="flex items-center gap-3 text-ink">
          <svg
            className="animate-spin h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
            <path className="opacity-75" d="M4 12a8 8 0 018-8v8z" strokeWidth="4" />
          </svg>
          <span className="text-sm">{processingLabel}</span>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Open http://localhost:3000. Check:
- Mic button is a circle (not a pill), ~64×64px
- Atlas purple border ring around it, softly breathing (scale pulse)
- "Plan my week" label appears below the circle
- Click the button in Chrome — listening state shows a red-border circle with a pulsing red dot inside

- [ ] **Step 3: Commit**

```bash
git add components/VoiceRecorder.tsx
git commit -m "feat: redesign mic button as breathing circle with label below"
```

---

## Task 5: Plan section — tabs, meal cards, plan history

**Files:**
- Modify: `app/page.tsx` (plan section tabs only)
- Modify: `components/MealPlanGrid.tsx`
- Modify: `components/PlanHistory.tsx`

**Interfaces:**
- Consumes: `bg-void`, `bg-surface`, `text-ink`, `text-dim`, `border-atlas` color tokens (Task 1)
- Produces: Floating pill tabs (no container bg), meal cards with `bg-void` + border-only selected state, plan history cards with updated border/hover

- [ ] **Step 1: Update tab styles in app/page.tsx**

Find the plan section tabs block:
```tsx
<div className="flex gap-1 mb-8 bg-white/5 rounded-xl p-1 w-fit">
  {(["plan", "shopping"] as Tab[]).map((tab) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
        activeTab === tab
          ? "bg-atlas text-white shadow-md"
          : "text-gray-400 hover:text-white"
      }`}
    >
      {tab === "plan" ? "Meal Plan" : "Shopping List"}
    </button>
  ))}
</div>
```

Replace with:

```tsx
<div className="flex gap-1 mb-8">
  {(["plan", "shopping"] as Tab[]).map((tab) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
        activeTab === tab
          ? "bg-atlas text-white"
          : "text-dim hover:text-ink"
      }`}
    >
      {tab === "plan" ? "Meal Plan" : "Shopping List"}
    </button>
  ))}
</div>
```

Also update the plan section container background from `bg-gray-900` to `bg-surface`:
```tsx
<section ref={planSectionRef} className="bg-surface py-12 px-6">
```

- [ ] **Step 2: Update MealPlanGrid.tsx**

Replace the entire file contents with:

```tsx
"use client";

import { useState } from "react";
import { IDayPlan, IMeal, IIngredient } from "@/lib/models/MealPlan";
import { metricHint } from "@/lib/unitConversion";

interface MealPlanGridProps {
  days: IDayPlan[];
}

const MEAL_TYPES: Array<keyof Pick<IDayPlan, "breakfast" | "lunch" | "dinner">> = [
  "breakfast",
  "lunch",
  "dinner",
];

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

function MealCell({
  meal,
  onClick,
  selected,
}: {
  meal: IMeal;
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border transition-all ${
        selected
          ? "border-atlas bg-void"
          : "border-white/[0.07] bg-void hover:bg-white/[0.03] hover:border-white/[0.12]"
      }`}
    >
      <p className="text-ink font-medium text-sm leading-snug">{meal.name}</p>
      <p className="text-dim text-xs mt-1 line-clamp-2">{meal.description}</p>
    </button>
  );
}

function IngredientDrawer({ meal }: { meal: IMeal }) {
  return (
    <div className="bg-void border border-white/[0.07] rounded-xl p-3 mt-3">
      <h4 className="text-ink font-medium text-sm mb-3">
        Ingredients for {meal.name}
      </h4>
      <ul className="space-y-1">
        {meal.ingredients.map((ing: IIngredient, i: number) => (
          <li key={i} className="flex justify-between text-sm">
            <span className="text-dim capitalize">{ing.name}</span>
            <span className="text-dim">
              {ing.quantity} {ing.unit}
              {metricHint(ing.quantity, ing.unit) && (
                <span className="text-dim/60 ml-1">{metricHint(ing.quantity, ing.unit)}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MealPlanGrid({ days }: MealPlanGridProps) {
  const [selected, setSelected] = useState<{ dayIdx: number; mealType: string } | null>(null);

  function toggle(dayIdx: number, mealType: string) {
    setSelected((prev) =>
      prev?.dayIdx === dayIdx && prev.mealType === mealType ? null : { dayIdx, mealType }
    );
  }

  return (
    <div className="w-full overflow-x-auto pb-2">
      {/* Header row */}
      <div className="grid grid-cols-7 gap-2 mb-2 min-w-[700px]">
        {days.map((d) => (
          <div
            key={d.day}
            className="text-center text-[10px] font-medium text-atlas uppercase tracking-widest"
          >
            {d.day.slice(0, 3)}
          </div>
        ))}
      </div>

      {/* Meal rows */}
      {MEAL_TYPES.map((mealType) => (
        <div key={mealType} className="mb-4 min-w-[700px]">
          <p className="text-[10px] font-medium text-dim uppercase tracking-widest mb-1 pl-1">
            {MEAL_LABELS[mealType]}
          </p>
          <div className="grid grid-cols-7 gap-2">
            {days.map((d, dayIdx) => {
              const meal = d[mealType];
              const isSelected =
                selected?.dayIdx === dayIdx && selected.mealType === mealType;
              return (
                <div key={d.day}>
                  <MealCell
                    meal={meal}
                    onClick={() => toggle(dayIdx, mealType)}
                    selected={isSelected}
                  />
                  {isSelected && <IngredientDrawer meal={meal} />}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Update PlanHistory.tsx**

Replace the entire file contents with:

```tsx
"use client";

import { useEffect, useState } from "react";

interface PlanSummary {
  _id: string;
  preferences: string;
  servings: number;
  createdAt: string;
}

interface PlanHistoryProps {
  onSelectPlan: (planId: string) => void;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 172800) return "Yesterday";
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function PlanHistory({ onSelectPlan }: PlanHistoryProps) {
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/plan")
      .then((res) => res.json())
      .then((data) => setPlans(data.plans ?? []))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-full mt-8">
        <div className="flex items-center gap-2 animate-pulse">
          <div className="h-3 w-3 bg-dim/30 rounded-full" />
          <div className="h-3 w-24 bg-dim/20 rounded" />
        </div>
      </div>
    );
  }

  if (plans.length === 0) return null;

  return (
    <div className="w-full mt-10">
      <h3 className="text-dim uppercase tracking-widest text-[10px] font-medium mb-3 text-center">
        Recent Plans
      </h3>
      <div className="space-y-2">
        {plans.map((plan) => (
          <button
            key={plan._id}
            onClick={() => onSelectPlan(plan._id)}
            className="w-full text-left p-3 rounded-xl border border-white/[0.07] bg-void
                       hover:bg-white/[0.03] hover:border-atlas/40
                       transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-dim text-xs shrink-0 pt-0.5">
                {timeAgo(plan.createdAt)}
              </span>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-ink text-sm truncate group-hover:text-ink transition-colors">
                  &ldquo;{plan.preferences}&rdquo;
                </p>
                <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-atlas/20 text-atlas">
                  {plan.servings} {plan.servings === 1 ? "serving" : "servings"}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify in browser**

Generate a meal plan. Check:
- Plan section has `surface` (`#161619`) background — slightly lighter than the hero void
- Tabs are floating pills with no container background; active tab is atlas purple
- Meal cards have a barely-visible hairline border on a `void` background; clicking a card highlights only the border (no purple fill)
- Day labels (Mon, Tue…) are 10px, uppercase, atlas purple
- Plan history cards (on hero) show hairline border, hover border shifts to atlas purple

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx components/MealPlanGrid.tsx components/PlanHistory.tsx
git commit -m "feat: update plan section — floating tabs, border-only card selection, token colors"
```

---

## Task 6: Shopping list

**Files:**
- Modify: `components/ShoppingList.tsx`

**Interfaces:**
- Consumes: `text-dim`, `text-ink`, `border-atlas` color tokens (Task 1)
- Produces: Category headers at 10px tracking-widest; item text using `text-ink`/`text-dim`; no structural changes

- [ ] **Step 1: Replace components/ShoppingList.tsx**

Replace the entire file contents with:

```tsx
"use client";

import { useState } from "react";
import { IShoppingItem } from "@/lib/models/MealPlan";

interface ShoppingListProps {
  items: IShoppingItem[];
}

const CATEGORY_ORDER = [
  "Produce",
  "Proteins",
  "Dairy",
  "Grains",
  "Pantry",
  "Frozen",
  "Other",
];

const CATEGORY_ICONS: Record<string, string> = {
  Produce: "🥦",
  Proteins: "🥩",
  Dairy: "🥛",
  Grains: "🌾",
  Pantry: "🫙",
  Frozen: "❄️",
  Other: "🛒",
};

export default function ShoppingList({ items }: ShoppingListProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  function toggle(key: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function copyToClipboard() {
    const lines = items
      .map((item) => `${item.name}: ${item.totalQuantity} ${item.unit}`)
      .join("\n");
    navigator.clipboard.writeText(lines);
  }

  const grouped: Record<string, IShoppingItem[]> = {};
  for (const item of items) {
    const cat = item.category || "Other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }

  const categories = CATEGORY_ORDER.filter((c) => grouped[c]?.length);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <p className="text-dim text-sm">
          {items.length} items · {checked.size} checked
        </p>
        <button
          onClick={copyToClipboard}
          className="text-atlas hover:text-atlas/80 text-sm font-medium flex items-center gap-1 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy list
        </button>
      </div>

      <div className="space-y-5">
        {categories.map((cat) => (
          <div key={cat}>
            <h4 className="text-[10px] font-medium uppercase tracking-widest text-dim mb-2 flex items-center gap-1">
              <span>{CATEGORY_ICONS[cat]}</span>
              {cat}
            </h4>
            <ul className="space-y-1">
              {grouped[cat].map((item) => {
                const key = `${item.name}||${item.unit}`;
                const isChecked = checked.has(key);
                return (
                  <li
                    key={key}
                    onClick={() => toggle(key)}
                    className="flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer hover:bg-white/[0.03] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                          isChecked
                            ? "bg-atlas border-atlas"
                            : "border-dim group-hover:border-ink"
                        }`}
                      >
                        {isChecked && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className={`capitalize text-sm transition-colors ${
                          isChecked ? "text-dim line-through" : "text-ink"
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                    <span
                      className={`text-sm transition-colors ${
                        isChecked ? "text-dim/50" : "text-dim"
                      }`}
                    >
                      {item.totalQuantity} {item.unit}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Switch to the Shopping List tab. Check:
- Category headers are 10px, uppercase, tracking-widest, muted gray
- Item names are `text-ink` (slightly warm off-white)
- Quantities are `text-dim`
- Checking an item applies line-through + dims both name and quantity
- Copy button still works (test in Chrome DevTools console or paste into a text field)

- [ ] **Step 3: Final full build check**

```bash
npm run build
```

Expected: zero TypeScript errors, clean build output.

- [ ] **Step 4: Commit**

```bash
git add components/ShoppingList.tsx
git commit -m "feat: update shopping list — 10px category headers, ink/dim token colors"
```

---

## Self-Review

**Spec coverage:**
- ✅ Color tokens: void, surface, ink, dim, atlas — Task 1
- ✅ Typography: DM Sans (body) + Cormorant Garamond (wordmark only) — Tasks 1 & 2
- ✅ Logo: SVG bowl-arc mark + serif wordmark — Task 2
- ✅ Hero background: pure CSS, no image, radial bloom — Task 3
- ✅ Centered layout — Task 3
- ✅ Tagline "Your week, spoken once." — Task 3
- ✅ Servings: inline, minimal, no label — Task 3
- ✅ Mic button: 64×64 circle, breathing ring, label below — Task 4
- ✅ Listening state: circle with red dot — Task 4
- ✅ Tabs: floating pills, no container background — Task 5
- ✅ Plan section bg: surface — Task 5
- ✅ Meal cards: void bg, border-only selected state — Task 5
- ✅ Day headers: 10px tracking-widest atlas — Task 5
- ✅ Plan history: border + hover token updates — Task 5
- ✅ Shopping list: category header sizing — Task 6
- ✅ Zero changes to API routes, lib/, state logic — enforced by global constraints

**Placeholder scan:** No TBDs, no "implement later", all code blocks are complete.

**Type consistency:** `text-ink`, `text-dim`, `bg-void`, `bg-surface`, `border-atlas`, `animate-breathe` — defined in Task 1, used consistently in Tasks 2–6. No naming drift detected.
