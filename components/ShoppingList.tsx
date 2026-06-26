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
