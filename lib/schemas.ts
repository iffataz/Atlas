import { z } from "zod";

export const CATEGORIES = [
  "Produce",
  "Proteins",
  "Dairy",
  "Grains",
  "Pantry",
  "Frozen",
  "Other",
] as const;

// Validates what the model returns before it reaches Mongo or the UI.
// Salvageable deviations are repaired (stray category -> Other, stringified
// numbers coerced); structural breakage (missing meal, wrong day count) fails.
export const IngredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.coerce.number(),
  unit: z.string().min(1),
  category: z.enum(CATEGORIES).catch("Other"),
});

export const MealSchema = z.object({
  name: z.string().min(1),
  description: z.string().catch(""),
  ingredients: z.array(IngredientSchema),
});

export const DayPlanSchema = z.object({
  day: z.string().min(1),
  breakfast: MealSchema,
  lunch: MealSchema,
  dinner: MealSchema,
});

export const MealPlanDaysSchema = z.object({
  days: z.array(DayPlanSchema).length(7),
});

export type MealPlanDays = z.infer<typeof MealPlanDaysSchema>;

// Over-long input is truncated (matching the previous slice behavior) rather
// than rejected — voice transcripts can legitimately run long.
export const PreferencesInputSchema = z.object({
  preferences: z
    .string()
    .trim()
    .min(1, "Preferences are required.")
    .transform((s) => s.slice(0, 500)),
  servings: z.coerce.number().int().min(1).max(20).catch(2),
});

export const RefinementInputSchema = z.object({
  instruction: z
    .string()
    .trim()
    .min(1, "Instruction is required.")
    .transform((s) => s.slice(0, 500)),
  // Present when the user changes servings after generation.
  servings: z.coerce.number().int().min(1).max(20).optional(),
});
