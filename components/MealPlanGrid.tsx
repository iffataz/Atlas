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
