"use client";

import { useEffect, useState } from "react";
import { IShoppingItem } from "@/lib/models/MealPlan";

interface ShoppingListProps {
  items: IShoppingItem[];
  planId: string;
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

// Checked state survives refresh/reload per plan; stale keys from refined
// plans are ignored harmlessly.
const storageKey = (planId: string) => `atlas-checked-${planId}`;

export default function ShoppingList({ items, planId }: ShoppingListProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(planId));
      setChecked(new Set(raw ? (JSON.parse(raw) as string[]) : []));
    } catch {
      setChecked(new Set());
    }
  }, [planId]);

  function toggle(key: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      try {
        localStorage.setItem(storageKey(planId), JSON.stringify(Array.from(next)));
      } catch {
        // Private mode / quota — checks still work for this session.
      }
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
    <div className="w-full border-2 border-ink bg-white shadow-brutal">
      <div className="flex justify-between items-center border-b-2 border-ink px-4 py-3">
        <h3 className="font-display uppercase tracking-widest text-sm text-ink">
          Shopping list
        </h3>
        <button
          onClick={copyToClipboard}
          className="border-2 border-ink bg-white text-ink text-[10px] font-display uppercase tracking-widest px-2.5 py-1 shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
        >
          Copy list
        </button>
      </div>

      <p className="text-muted text-xs uppercase tracking-widest px-4 py-2 border-b border-ink/20">
        {items.length} items · {checked.size} checked
      </p>

      <div className="p-4 space-y-6">
        {categories.map((cat) => (
          <div key={cat}>
            <h4 className="font-display uppercase tracking-widest text-xs text-ink border-b-2 border-ink pb-1.5 mb-2">
              {cat}
            </h4>
            <ul>
              {grouped[cat].map((item) => {
                const key = `${item.name}||${item.unit}`;
                const isChecked = checked.has(key);
                return (
                  <li key={key} className="py-1.5">
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggle(key)}
                          className="peer sr-only"
                          aria-label={`${item.name}, ${item.totalQuantity} ${item.unit}`}
                        />
                        <span
                          aria-hidden="true"
                          className={`w-4 h-4 border-2 border-ink flex-shrink-0 flex items-center justify-center transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-atlas ${
                            isChecked ? "bg-atlas border-atlas" : "bg-white group-hover:bg-atlas-light"
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
                        </span>
                        <span
                          className={`capitalize text-sm transition-colors ${
                            isChecked ? "text-muted line-through" : "text-ink"
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>
                      <span
                        className={`text-sm transition-colors ${
                          isChecked ? "text-muted/50" : "text-muted"
                        }`}
                      >
                        {item.totalQuantity} {item.unit}
                      </span>
                    </label>
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
