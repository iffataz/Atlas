import type { IDayPlan } from "./models/MealPlan";

// Changing servings is plain arithmetic, so it's done here instead of asking
// the model — instant, free of the LLM rate limit, and it can't alter meals.
// Quantities keep 2 decimals; the shopping list applies its own rounding.
export function scaleDays(days: IDayPlan[], from: number, to: number): IDayPlan[] {
  const factor = to / from;
  const scaleMeal = (meal: IDayPlan["breakfast"]) => ({
    ...meal,
    ingredients: meal.ingredients.map((ing) => ({
      ...ing,
      quantity: Math.round(ing.quantity * factor * 100) / 100,
    })),
  });
  return days.map((d) => ({
    ...d,
    breakfast: scaleMeal(d.breakfast),
    lunch: scaleMeal(d.lunch),
    dinner: scaleMeal(d.dinner),
  }));
}
