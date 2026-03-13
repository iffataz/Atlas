import { IDayPlan, IIngredient, IShoppingItem } from "./models/MealPlan";

// Normalize ingredient name: lowercase, trim, basic singularization
function normalizeName(name: string): string {
  const lower = name.toLowerCase().trim();
  // Common plural → singular rules
  const irregulars: Record<string, string> = {
    tomatoes: "tomato",
    potatoes: "potato",
    onions: "onion",
    eggs: "egg",
    leaves: "leaf",
    loaves: "loaf",
    knives: "knife",
    berries: "berry",
    cherries: "cherry",
    strawberries: "strawberry",
    blueberries: "blueberry",
    raspberries: "raspberry",
    cloves: "clove",
    olives: "olive",
  };
  if (irregulars[lower]) return irregulars[lower];
  // Drop trailing 's' only if word is >3 chars and ends in s (but not ss)
  if (lower.length > 3 && lower.endsWith("s") && !lower.endsWith("ss")) {
    return lower.slice(0, -1);
  }
  return lower;
}

export function aggregateIngredients(days: IDayPlan[]): IShoppingItem[] {
  // Flatten all ingredients across all meals
  const allIngredients: IIngredient[] = [];
  for (const day of days) {
    for (const meal of [day.breakfast, day.lunch, day.dinner]) {
      if (meal?.ingredients) {
        allIngredients.push(...meal.ingredients);
      }
    }
  }

  // Group by (normalizedName, unit)
  const grouped = new Map<string, IShoppingItem>();

  for (const ing of allIngredients) {
    const normalizedName = normalizeName(ing.name);
    const key = `${normalizedName}||${ing.unit.toLowerCase()}`;

    const existing = grouped.get(key);
    if (existing) {
      existing.totalQuantity = Math.round((existing.totalQuantity + ing.quantity) * 100) / 100;
    } else {
      grouped.set(key, {
        name: normalizedName,
        totalQuantity: ing.quantity,
        unit: ing.unit,
        category: ing.category,
      });
    }
  }

  // Sort by category, then name
  const categoryOrder: Record<string, number> = {
    Produce: 0,
    Proteins: 1,
    Dairy: 2,
    Grains: 3,
    Pantry: 4,
    Frozen: 5,
    Other: 6,
  };

  return Array.from(grouped.values()).sort((a, b) => {
    const catDiff =
      (categoryOrder[a.category] ?? 6) - (categoryOrder[b.category] ?? 6);
    if (catDiff !== 0) return catDiff;
    return a.name.localeCompare(b.name);
  });
}
