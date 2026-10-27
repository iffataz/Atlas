import { describe, it, expect } from "vitest";
import { aggregateIngredients } from "./aggregateIngredients";
import type { IDayPlan, IIngredient } from "./models/MealPlan";

const ing = (name: string, quantity: number, unit: string, category = "Pantry"): IIngredient => ({
  name,
  quantity,
  unit,
  category,
});

const dayWith = (...ingredients: IIngredient[]): IDayPlan[] => [
  {
    day: "Monday",
    breakfast: { name: "b", description: "", ingredients },
    lunch: { name: "l", description: "", ingredients: [] },
    dinner: { name: "d", description: "", ingredients: [] },
  },
];

const find = (days: IDayPlan[], name: string) =>
  aggregateIngredients(days).filter((i) => i.name === name);

describe("aggregateIngredients", () => {
  it("singularizes plurals but leaves words ending in -us alone", () => {
    const list = aggregateIngredients(
      dayWith(ing("hummus", 100, "g"), ing("asparagus", 1, "bunch"), ing("couscous", 200, "g"), ing("Carrots", 2, "piece"))
    );
    expect(list.map((i) => i.name).sort()).toEqual(["asparagus", "carrot", "couscous", "hummus"]);
  });

  it("merges count-unit aliases into one item", () => {
    const eggs = find(dayWith(ing("egg", 2, "piece"), ing("eggs", 1, "whole")), "egg");
    expect(eggs).toEqual([{ name: "egg", totalQuantity: 3, unit: "piece", category: "Pantry" }]);
  });

  it("keeps small amounts instead of rounding them to zero", () => {
    const [salt] = find(dayWith(ing("salt", 0.25, "tsp")), "salt");
    expect(salt.totalQuantity).toBe(1);
    expect(salt.unit).toBe("ml");
  });

  it("still rounds larger metric amounts to the nearest 10", () => {
    const [rice] = find(dayWith(ing("rice", 123, "g")), "rice");
    expect(rice.totalQuantity).toBe(120);
  });
});
