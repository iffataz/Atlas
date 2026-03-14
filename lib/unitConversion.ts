const COOKING_TO_METRIC: Record<string, { multiplier: number; unit: string }> = {
  cup: { multiplier: 250, unit: "ml" },
  cups: { multiplier: 250, unit: "ml" },
  tbsp: { multiplier: 15, unit: "ml" },
  tablespoon: { multiplier: 15, unit: "ml" },
  tablespoons: { multiplier: 15, unit: "ml" },
  tsp: { multiplier: 5, unit: "ml" },
  teaspoon: { multiplier: 5, unit: "ml" },
  teaspoons: { multiplier: 5, unit: "ml" },
};

const COUNT_UNITS = new Set([
  "piece", "slice", "clove", "bunch", "can", "whole",
]);

/** Convert cooking units (cup, tbsp, tsp) to metric. No rounding. */
export function convertToMetric(
  quantity: number,
  unit: string
): { quantity: number; unit: string } {
  const entry = COOKING_TO_METRIC[unit.toLowerCase().trim()];
  if (entry) {
    return { quantity: quantity * entry.multiplier, unit: entry.unit };
  }
  return { quantity, unit };
}

/** Scale up (ml→L, g→kg) and apply shopping-friendly rounding. */
export function roundForShopping(
  quantity: number,
  unit: string
): { quantity: number; unit: string } {
  const u = unit.toLowerCase().trim();

  if (u === "ml") {
    if (quantity >= 1000) {
      return { quantity: Math.round((quantity / 1000) * 10) / 10, unit: "L" };
    }
    return { quantity: Math.round(quantity / 10) * 10, unit: "ml" };
  }

  if (u === "g") {
    if (quantity >= 1000) {
      return { quantity: Math.round((quantity / 1000) * 10) / 10, unit: "kg" };
    }
    return { quantity: Math.round(quantity / 10) * 10, unit: "g" };
  }

  if (u === "l") {
    return { quantity: Math.round(quantity * 10) / 10, unit: "L" };
  }

  if (u === "kg") {
    return { quantity: Math.round(quantity * 10) / 10, unit: "kg" };
  }

  if (COUNT_UNITS.has(u)) {
    return { quantity: Math.ceil(quantity), unit };
  }

  return { quantity, unit };
}
