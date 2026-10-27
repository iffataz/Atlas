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

// Spellings the model uses interchangeably for the same count unit. Folding
// them lets "2 egg (piece)" and "1 egg (whole)" merge into one shopping item.
const UNIT_ALIASES: Record<string, string> = {
  whole: "piece",
  pieces: "piece",
  slices: "slice",
  cloves: "clove",
  bunches: "bunch",
  cans: "can",
};

/** Canonical spelling of a unit for grouping; unknown units pass through. */
export function normalizeUnit(unit: string): string {
  const u = unit.toLowerCase().trim();
  return UNIT_ALIASES[u] ?? unit.trim();
}

// Rescaling a plan (e.g. 3 -> 1 -> 3 servings) leaves float noise like
// 0.999999 or 1.0000001; anything this close to a whole number counts as it.
const COUNT_EPSILON = 1e-4;

/** Round a recipe quantity for display: at most 2 decimals, no float noise. */
export function formatQuantity(quantity: number): number {
  return Math.round(quantity * 100) / 100;
}

/** Round small metric amounts finely and larger ones to the nearest 10. */
function roundMetric(quantity: number): number {
  // Under 50 ml/g (spices, oil, salt) the nearest 10 would erase the amount:
  // 1/4 tsp salt is 1.25 ml and used to show as "0 ml".
  if (quantity <= 0) return 0;
  if (quantity < 50) return Math.max(1, Math.round(quantity));
  return Math.round(quantity / 10) * 10;
}

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

/** Return a metric string like "(500 ml)" if the unit is a cooking unit, or null if already metric. */
export function metricHint(quantity: number, unit: string): string | null {
  const entry = COOKING_TO_METRIC[unit.toLowerCase().trim()];
  if (!entry) return null;
  const converted = quantity * entry.multiplier;
  const rounded = roundForShopping(converted, entry.unit);
  return `(${rounded.quantity} ${rounded.unit})`;
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
    return { quantity: roundMetric(quantity), unit: "ml" };
  }

  if (u === "g") {
    if (quantity >= 1000) {
      return { quantity: Math.round((quantity / 1000) * 10) / 10, unit: "kg" };
    }
    return { quantity: roundMetric(quantity), unit: "g" };
  }

  if (u === "l") {
    return { quantity: Math.round(quantity * 10) / 10, unit: "L" };
  }

  if (u === "kg") {
    return { quantity: Math.round(quantity * 10) / 10, unit: "kg" };
  }

  if (COUNT_UNITS.has(u)) {
    return { quantity: Math.ceil(quantity - COUNT_EPSILON), unit };
  }

  return { quantity, unit };
}
