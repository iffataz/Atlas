import type { IDayPlan } from "./models/MealPlan";

// Changing servings is plain arithmetic, so it's done here instead of asking
// the model — instant, free of the LLM rate limit, and it can't alter meals.
// Quantities keep 6 decimals rather than 2 so that scaling back and forth
// (3 -> 1 -> 3) doesn't drift (1 -> 0.99); the UI rounds for display and the
// shopping list applies its own rounding.
export function scaleDays(days: IDayPlan[], from: number, to: number): IDayPlan[] {
  const factor = to / from;
  const scaleMeal = (meal: IDayPlan["breakfast"]) => ({
    ...meal,
    ingredients: meal.ingredients.map((ing) => ({
      ...ing,
      quantity: Math.round(ing.quantity * factor * 1e6) / 1e6,
    })),
  });
  return days.map((d) => ({
    ...d,
    breakfast: scaleMeal(d.breakfast),
    lunch: scaleMeal(d.lunch),
    dinner: scaleMeal(d.dinner),
  }));
}
