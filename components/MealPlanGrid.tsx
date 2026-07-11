"use client";

import { useState } from "react";
import { IDayPlan, IMeal, IIngredient } from "@/lib/models/MealPlan";
import { metricHint } from "@/lib/unitConversion";

export type MealType = "breakfast" | "lunch" | "dinner";

interface MealPlanGridProps {
  days: IDayPlan[];
  onSwapMeal?: (day: string, mealType: MealType) => void;
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
  label,
  onClick,
  selected,
}: {
  meal: IMeal;
  label: string;
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full h-full text-left p-3 border-2 border-ink transition-colors ${
        selected
          ? "bg-atlas text-white"
          : "bg-white hover:bg-atlas-light"
      }`}
    >
      <p
        className={`text-[10px] font-display uppercase tracking-widest mb-1 ${
          selected ? "text-atlas-light" : "text-atlas"
        }`}
      >
        {label}
      </p>
      <p className={`font-medium text-sm leading-snug ${selected ? "text-white" : "text-ink"}`}>
        {meal.name}
      </p>
      <p className={`text-xs mt-1 line-clamp-2 ${selected ? "text-atlas-light" : "text-muted"}`}>
        {meal.description}
      </p>
    </button>
  );
}

function IngredientDrawer({
  meal,
  onSwap,
}: {
  meal: IMeal;
  onSwap?: () => void;
}) {
  return (
    <div className="border-2 border-t-0 border-ink bg-white p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h4 className="font-display uppercase tracking-widest text-xs text-ink">
          Ingredients — {meal.name}
        </h4>
        {onSwap && (
          <button
            onClick={onSwap}
            className="border-2 border-ink bg-white text-ink text-[10px] font-display uppercase tracking-widest px-2.5 py-1 shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all shrink-0"
          >
            Swap this meal
          </button>
        )}
      </div>
      <ul>
        {meal.ingredients.map((ing: IIngredient, i: number) => (
          <li
            key={i}
            className="flex justify-between text-sm py-1.5 border-b border-ink/20 last:border-b-0"
          >
            <span className="text-ink capitalize">{ing.name}</span>
            <span className="text-muted">
              {ing.quantity} {ing.unit}
              {metricHint(ing.quantity, ing.unit) && (
                <span className="text-muted/60 ml-1">{metricHint(ing.quantity, ing.unit)}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MealPlanGrid({ days, onSwapMeal }: MealPlanGridProps) {
  const [selected, setSelected] = useState<{ dayIdx: number; mealType: string } | null>(null);

  function toggle(dayIdx: number, mealType: string) {
    setSelected((prev) =>
      prev?.dayIdx === dayIdx && prev.mealType === mealType ? null : { dayIdx, mealType }
    );
  }

  return (
    <div className="w-full space-y-6">
      {days.map((d, dayIdx) => {
        const selectedMeal =
          selected?.dayIdx === dayIdx
            ? d[selected.mealType as (typeof MEAL_TYPES)[number]]
            : null;

        return (
          <div key={d.day} className="shadow-brutal">
            {/* Day header bar */}
            <div className="bg-ink text-white border-2 border-ink px-4 py-2">
              <h3 className="font-display uppercase tracking-widest text-sm">{d.day}</h3>
            </div>

            {/* Meal cells */}
            <div className="grid grid-cols-1 sm:grid-cols-3 -mt-0.5">
              {MEAL_TYPES.map((mealType) => (
                <MealCell
                  key={mealType}
                  meal={d[mealType]}
                  label={MEAL_LABELS[mealType]}
                  onClick={() => toggle(dayIdx, mealType)}
                  selected={selected?.dayIdx === dayIdx && selected.mealType === mealType}
                />
              ))}
            </div>

            {/* Ingredient drawer spans the full day card */}
            {selectedMeal && (
              <IngredientDrawer
                meal={selectedMeal}
                onSwap={
                  onSwapMeal
                    ? () => onSwapMeal(d.day, selected!.mealType as MealType)
                    : undefined
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
