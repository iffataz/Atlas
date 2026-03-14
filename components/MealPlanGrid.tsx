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
          ? "border-atlas bg-purple-900/40 shadow-md"
          : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
      }`}
    >
      <p className="text-white font-medium text-sm leading-snug">{meal.name}</p>
      <p className="text-gray-400 text-xs mt-1 line-clamp-2">{meal.description}</p>
    </button>
  );
}

function IngredientDrawer({ meal }: { meal: IMeal }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-3">
      <h4 className="text-white font-semibold text-sm mb-3">
        Ingredients for {meal.name}
      </h4>
      <ul className="space-y-1">
        {meal.ingredients.map((ing: IIngredient, i: number) => (
          <li key={i} className="flex justify-between text-sm">
            <span className="text-gray-300 capitalize">{ing.name}</span>
            <span className="text-gray-400">
              {ing.quantity} {ing.unit}
              {metricHint(ing.quantity, ing.unit) && (
                <span className="text-gray-500 ml-1">{metricHint(ing.quantity, ing.unit)}</span>
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
          <div key={d.day} className="text-center text-xs font-semibold text-atlas uppercase tracking-wider">
            {d.day.slice(0, 3)}
          </div>
        ))}
      </div>

      {/* Meal rows */}
      {MEAL_TYPES.map((mealType) => (
        <div key={mealType} className="mb-4 min-w-[700px]">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 pl-1">
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
