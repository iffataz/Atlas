# Logo Redesign — Plate + Fork Mark

**Date:** 2026-06-29  
**Scope:** Replace the current bowl-arc SVG mark in `components/AtlasLogo.tsx` with a bold filled plate-and-fork mark. Wordmark and all other components unchanged.

---

## Mark Design

A filled atlas-purple circle (plate) with a white fork silhouette centered inside it. All elements use `fill`, no strokes — bold and weighted, not minimalistic.

### SVG spec

- **viewBox:** `0 0 36 36` (square; current 36×32 was for asymmetric bowl mark)
- **Dimensions:** `width="36" height="36"`
- **Plate:** `<circle cx="18" cy="18" r="15" fill="#7447ae" />`
- **Fork tines (3×):** white `<rect rx="1">`, 2px wide × 8px tall, rounded tops
  - Left tine: `x="13" y="8"`
  - Center tine: `x="17" y="8"`
  - Right tine: `x="21" y="8"`
- **Neck:** white `<rect x="14" y="15" width="8" height="3">` connecting tines to handle
- **Handle:** white `<rect rx="1.5" x="16.5" y="18" width="3" height="11">`, descends from neck

All fork elements: `fill="white"`. No `stroke` on any element.

### Lockup

Same as current: mark left, `<span>` wordmark right, `gap-3`, vertically centered.

```tsx
<div className="flex items-center gap-3">
  <svg …>…</svg>
  <span className="font-display font-light tracking-widest text-xl text-ink select-none">
    atlas
  </span>
</div>
```

---

## File Changed

| File | Change |
|---|---|
| `components/AtlasLogo.tsx` | Replace SVG internals; update viewBox to `0 0 36 36` and dimensions to `36×36` |

No other files change.

---

## Verification

- `npm run build` — zero TypeScript errors
- `npm run dev` → http://localhost:3000 — purple circle with white fork visible in hero, centered
- Zoom browser out to ~50% — mark should still read clearly as plate + fork
