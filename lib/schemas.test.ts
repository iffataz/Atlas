import { describe, it, expect } from "vitest";
import {
  MealPlanDaysSchema,
  PreferencesInputSchema,
  RefinementInputSchema,
} from "./schemas";

const meal = (name = "Oatmeal") => ({
  name,
  description: "A bowl of oats.",
  ingredients: [{ name: "oat", quantity: 1, unit: "cup", category: "Grains" }],
});

const day = (dayName: string) => ({
  day: dayName,
  breakfast: meal(),
  lunch: meal("Salad"),
  dinner: meal("Stir fry"),
});

const WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const validPlan = () => ({ days: WEEK.map(day) });

describe("MealPlanDaysSchema", () => {
  it("accepts a valid 7-day plan", () => {
    expect(MealPlanDaysSchema.safeParse(validPlan()).success).toBe(true);
  });

  it("rejects a 6-day plan", () => {
    const plan = validPlan();
    plan.days.pop();
    expect(MealPlanDaysSchema.safeParse(plan).success).toBe(false);
  });

  it("rejects a day with a missing meal", () => {
    const plan = validPlan();
    delete (plan.days[2] as Record<string, unknown>).dinner;
    expect(MealPlanDaysSchema.safeParse(plan).success).toBe(false);
  });

  it("rejects an ingredient without a name", () => {
    const plan = validPlan();
    plan.days[0].breakfast.ingredients[0].name = "";
    expect(MealPlanDaysSchema.safeParse(plan).success).toBe(false);
  });

  it("repairs an unknown category to Other", () => {
    const plan = validPlan();
    plan.days[0].breakfast.ingredients[0].category = "Seafood";
    const result = MealPlanDaysSchema.safeParse(plan);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.days[0].breakfast.ingredients[0].category).toBe("Other");
    }
  });

  it("coerces stringified quantities to numbers", () => {
    const plan = validPlan();
    (plan.days[0].breakfast.ingredients[0] as Record<string, unknown>).quantity = "2.5";
    const result = MealPlanDaysSchema.safeParse(plan);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.days[0].breakfast.ingredients[0].quantity).toBe(2.5);
    }
  });
});

describe("PreferencesInputSchema", () => {
  it("rejects empty preferences", () => {
    expect(PreferencesInputSchema.safeParse({ preferences: "  " }).success).toBe(false);
  });

  it("truncates over-long preferences instead of rejecting", () => {
    const result = PreferencesInputSchema.safeParse({
      preferences: "x".repeat(900),
      servings: 2,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.preferences).toHaveLength(500);
  });

  it("coerces numeric-string servings and repairs out-of-range values", () => {
    const ok = PreferencesInputSchema.safeParse({ preferences: "vegan", servings: "4" });
    expect(ok.success && ok.data.servings).toBe(4);
    const repaired = PreferencesInputSchema.safeParse({ preferences: "vegan", servings: 99 });
    expect(repaired.success && repaired.data.servings).toBe(2);
  });
});

describe("RefinementInputSchema", () => {
  it("rejects a missing instruction", () => {
    expect(RefinementInputSchema.safeParse({}).success).toBe(false);
  });

  it("accepts and trims a valid instruction", () => {
    const result = RefinementInputSchema.safeParse({ instruction: "  more fish  " });
    expect(result.success && result.data.instruction).toBe("more fish");
  });
});
