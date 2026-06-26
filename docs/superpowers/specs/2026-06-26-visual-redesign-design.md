# Atlas Visual Redesign — Design Spec
**Date:** 2026-06-26  
**Scope:** Full visual overhaul of the Atlas meal planning app. Zero changes to functionality, API routes, data models, or state logic.

---

## Goals

- Replace the current hero background PNG with a pure-CSS dark background + radial purple bloom
- Replace the current Flutter-esque chevron logo with an inline SVG bowl-arc mark + Cormorant Garamond wordmark
- Center all hero content (currently right-aligned)
- Reduce visual noise throughout: fewer fills, more border-only states, quieter secondary elements
- Establish a deliberate token system (6 colors, 2 typefaces) instead of ad-hoc Tailwind grays

---

## Color Tokens

Six named values. All other color decisions derive from these.

| Token | Value | Role |
|---|---|---|
| `void` | `#0c0c0f` | Page background |
| `surface` | `#161619` | Plan section bg, card bg |
| `border` | `rgba(255,255,255,0.07)` | All borders |
| `atlas` | `#7447ae` | Accent: mic ring, active tab, checkboxes, links |
| `text-primary` | `#f0eef4` | Headings, meal names, primary labels |
| `text-muted` | `#6b7280` | Secondary text, hints, captions, timestamps |

Update `tailwind.config.ts` to add `void`, `surface`, `text-primary`, `text-muted` as color tokens alongside existing `atlas`.

---

## Typography

Two Google Fonts loaded in `app/layout.tsx` via `next/font/google`:

- **Cormorant Garamond** (`weight: ['300']`, `subsets: ['latin']`): used **only** for the "atlas" wordmark in the logo. Light weight, `tracking-widest`. This is the single typographic personality moment — nothing else on the page is serif.
- **DM Sans** (`weight: ['300', '400', '500']`, `subsets: ['latin']`): all other text — tagline, buttons, labels, meal names, captions, nav.

Set `dmSans.className` on `<body>` in layout. Apply `cormorant.className` only to the wordmark span.

### Type scale
| Role | Size | Weight | Color |
|---|---|---|---|
| Logo wordmark | 20px | 300 (light) | text-primary |
| Tagline | 16px | 400 | text-muted |
| Button label | 14px | 500 | white |
| Meal name | 13px | 500 | text-primary |
| Description / caption | 12px | 400 | text-muted |
| Day header | 10px | 500, uppercase, tracked | atlas |

---

## Logo Mark

Inline SVG, no external image. Renders at 36×36px in the hero, 24×24px elsewhere if needed.

**Geometry:**
- A thin-stroke semicircle (bottom half) representing a bowl: `path` from left edge to right edge curving down, `stroke-width="1.5"`, `stroke-linecap="round"`, no fill
- A short vertical line from the bowl's center point upward (spoon handle): `line`, same stroke
- Color: `currentColor` (inherits white in dark context)

**Lockup:** Mark (36×36) + wordmark ("atlas", Cormorant Garamond, 20px, tracking-widest, font-light) side by side, vertically centered. Total lockup is centered in the hero.

---

## Hero Section (`app/page.tsx`)

### Background
Remove `style={{ backgroundImage: "url('/ATLAS_final.png')" }}` and the `bg-black/50` overlay entirely.

Replace with:
```
bg-[#0c0c0f]
```
Plus a single radial gradient bloom as a `div` positioned absolutely behind the logo/content area:
```css
background: radial-gradient(ellipse 70% 55% at 50% 25%, rgba(116,71,174,0.18) 0%, transparent 70%);
```

### Layout
Change from `flex justify-end` (right-aligned) to `flex items-center justify-center` with a centered column. Max width ~480px.

```
[logo lockup]          ← centered, ~80px from top of viewport content
[tagline]              ← "Your week, spoken once."  16px, text-muted, mt-3
[mic button]           ← mt-10, centered circle
[button label]         ← "Plan my week" 14px, mt-2, text-muted
[servings selector]    ← mt-4, inline, minimal
[listening/loading UI] ← same as now, centered
[error]                ← same as now, centered
[recent plans]         ← same as now, centered, below hairline divider
[github link]          ← bottom of section, centered, very small
```

### Tagline
Replace current two-line heading:
```jsx
<span className="text-2xl font-normal block mb-1">Hi, I am</span>
Atlas.
```
With a single logo lockup (mark + wordmark) and a tagline below:
```
Your week, spoken once.
```

### Mic Button (signature element)
Replace the current `rounded-full` pill button with a 64×64px circle button:
- Border: `2px solid #7447ae` (atlas purple ring)
- Background: transparent
- Icon: microphone SVG centered, 24×24, white
- Idle animation: `animate-pulse` on the ring only (slow, 2s) — a breathing effect
- Listening state: replace pulse with a faster scale animation on the ring
- The text label "Plan my week" moves *below* the circle button as a small caption

### Servings selector
- Remove the `<label>` element
- Inline as: `2 servings ▾` — a single `<select>` styled minimally, no visible border, text-muted color
- Sits below the button label, centered

### Loading state
Same spinner + text, centered. Remove the duplicate spinner that currently exists both in `VoiceRecorder` and `page.tsx` — the one in `page.tsx` is the hero loading state; keep both but ensure they're not both visible simultaneously (they aren't currently, so no change needed).

### Ready state (refinement)
- Quoted preferences text: italic, text-muted, centered
- "Refine your plan" button: same circle button style as initial mic button
- "Start over": small, text-muted, underline, centered below

---

## Plan Section

### Container
- Background: `surface` (`#161619`) — the step up from `void` creates the implicit section break; no border-top needed
- Padding: `py-12 px-6` (same as now)

### Tabs
- Remove `bg-white/5 rounded-xl p-1` container — just two pill buttons floating
- Active: `bg-atlas text-white rounded-full px-5 py-1.5 text-sm font-medium`
- Inactive: `text-muted hover:text-primary text-sm font-medium px-5 py-1.5`

### Meal Cards
- Background: `#0c0c0f` (void) — cards sit darker than the surface section bg, subtle inset feel
- Border: `rgba(255,255,255,0.07)` hairline
- Selected state: `border-atlas` only — remove `bg-purple-900/40` fill, border alone is cleaner
- Rounded: `rounded-lg` (no change)

### Day Headers
- `text-atlas text-[10px] font-medium uppercase tracking-widest` — slight tightening from current

### Ingredient Drawer
- No structural changes; slight padding reduction from `p-4` to `p-3`
- Border color updated to `border` token

### Shopping List
- No structural changes
- Category headers: `text-[10px]` tracking-widest, `text-muted`
- Checked state: same line-through + text-muted behavior
- Checkbox: atlas purple fill (no change)

---

## Files Changed

| File | Change |
|---|---|
| `tailwind.config.ts` | Add `void`, `surface`, `text-primary`, `text-muted` color tokens |
| `app/layout.tsx` | Load DM Sans + Cormorant Garamond via `next/font/google`; apply DM Sans to body |
| `app/globals.css` | No changes needed |
| `app/page.tsx` | Hero background, layout alignment, heading → logo lockup, mic button style, tagline, servings selector, centering throughout |
| `components/VoiceRecorder.tsx` | Button becomes 64×64 circle; label moves below; listening/processing states centered |
| `components/MealPlanGrid.tsx` | Card bg, selected border-only state, day header sizing |
| `components/ShoppingList.tsx` | Tab style, category header sizing |
| `components/PlanHistory.tsx` | Border token, hover state color |

---

## What Does Not Change

- All API routes and data fetching logic
- State machine (`AppState`, `VoiceStatus`)
- Speech recognition integration
- MongoDB / Groq integration
- Responsive scroll behavior (`planSectionRef`)
- Shopping list check/copy functionality
- Plan history load functionality
- `next.config.mjs`, `tailwind.config.ts` content paths (only extends colors)

---

## Spec Self-Review

- No TBDs or placeholders remain
- Color tokens are exhaustive — every current ad-hoc gray has a named replacement
- Typography: both fonts have explicit weights listed; no ambiguity on where each is used
- The circle mic button is the single animated element; nothing else animates beyond existing spinner
- Scope is tight: 6 files, visual layer only
