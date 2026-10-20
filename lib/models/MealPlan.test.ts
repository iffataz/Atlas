import { describe, it, expect } from "vitest";
import MealPlan from "./MealPlan";

const meal = (description: string) => ({
  name: "Oatmeal",
  description,
  ingredients: [{ name: "oat", quantity: 1, unit: "cup", category: "Grains" }],
});

describe("MealPlan model", () => {
  it("accepts an empty meal description (zod repairs bad ones to '')", () => {
    const doc = new MealPlan({
      preferences: "vegan",
      servings: 2,
      days: [{ day: "Monday", breakfast: meal(""), lunch: meal("ok"), dinner: meal("ok") }],
      shoppingList: [],
    });
    expect(doc.validateSync()).toBeUndefined();
  });
});
