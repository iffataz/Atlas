import { describe, it, expect } from "vitest";
import { scaleDays } from "./scalePlan";
import type { IDayPlan } from "./models/MealPlan";

const meal = (quantity: number) => ({
  name: "Oatmeal",
  description: "A bowl of oats.",
  ingredients: [{ name: "oat", quantity, unit: "cup", category: "Grains" }],
});

const days: IDayPlan[] = [
  { day: "Monday", breakfast: meal(1), lunch: meal(2), dinner: meal(3) },
];

describe("scaleDays", () => {
  it("scales every meal's quantities by to/from", () => {
    const [monday] = scaleDays(days, 2, 4);
    expect(monday.breakfast.ingredients[0].quantity).toBe(2);
    expect(monday.lunch.ingredients[0].quantity).toBe(4);
    expect(monday.dinner.ingredients[0].quantity).toBe(6);
  });

  it("rounds to 2 decimals", () => {
    const [monday] = scaleDays(days, 3, 1);
    expect(monday.breakfast.ingredients[0].quantity).toBe(0.33);
  });

  it("keeps meal names and does not mutate the input", () => {
    const [monday] = scaleDays(days, 2, 8);
    expect(monday.dinner.name).toBe("Oatmeal");
    expect(days[0].breakfast.ingredients[0].quantity).toBe(1);
  });
});
