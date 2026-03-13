import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export const geminiFlash = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
  },
});

export const MEAL_PLAN_SCHEMA = `{
  "days": [
    {
      "day": "Monday",
      "breakfast": {
        "name": "string",
        "description": "string (1 sentence)",
        "ingredients": [
          { "name": "string", "quantity": number, "unit": "string", "category": "Produce|Proteins|Dairy|Grains|Pantry|Frozen|Other" }
        ]
      },
      "lunch": { /* same structure as breakfast */ },
      "dinner": { /* same structure as breakfast */ }
    },
    /* repeat for Tuesday through Sunday */
  ]
}`;

export function buildMealPlanPrompt(preferences: string, servings: number): string {
  return `You are a meal planning assistant. Generate a healthy, varied 7-day meal plan (Monday to Sunday) with breakfast, lunch, and dinner for each day.

User preferences: "${preferences}"
Servings per meal: ${servings}

Return ONLY valid JSON matching this exact structure:
{
  "days": [
    {
      "day": "Monday",
      "breakfast": {
        "name": "Meal name",
        "description": "One sentence description",
        "ingredients": [
          { "name": "ingredient name (singular, lowercase)", "quantity": 2, "unit": "cups", "category": "Produce" }
        ]
      },
      "lunch": {
        "name": "Meal name",
        "description": "One sentence description",
        "ingredients": [
          { "name": "ingredient name (singular, lowercase)", "quantity": 1, "unit": "tbsp", "category": "Pantry" }
        ]
      },
      "dinner": {
        "name": "Meal name",
        "description": "One sentence description",
        "ingredients": [
          { "name": "ingredient name (singular, lowercase)", "quantity": 200, "unit": "g", "category": "Proteins" }
        ]
      }
    }
  ]
}

Rules:
- Include all 7 days (Monday through Sunday)
- Scale ingredient quantities for ${servings} serving(s)
- ingredient "name" must be singular lowercase (e.g. "egg" not "eggs", "tomato" not "tomatoes")
- "unit" must be a standard cooking unit: g, kg, ml, L, cup, tbsp, tsp, piece, slice, clove, bunch, can, or "whole"
- "category" must be exactly one of: Produce, Proteins, Dairy, Grains, Pantry, Frozen, Other
- Vary cuisines and ingredients across the week for nutritional balance
- Respect the user's dietary preferences and restrictions strictly`;
}

export function buildRefinementPrompt(
  existingPlan: object,
  instruction: string,
  servings: number
): string {
  return `You are a meal planning assistant. The user wants to modify their existing meal plan.

Instruction: "${instruction}"
Servings per meal: ${servings}

Current meal plan:
${JSON.stringify(existingPlan, null, 2)}

Return ONLY valid JSON containing just the modified days in the same structure as the input. Only include days that need to change. Use the same ingredient format:
- "name": singular lowercase string
- "quantity": number
- "unit": standard cooking unit (g, kg, ml, L, cup, tbsp, tsp, piece, slice, clove, bunch, can, or "whole")
- "category": one of Produce, Proteins, Dairy, Grains, Pantry, Frozen, Other

Example response if only Monday dinner changes:
{
  "days": [
    {
      "day": "Monday",
      "breakfast": { /* unchanged — copy from original */ },
      "lunch": { /* unchanged — copy from original */ },
      "dinner": {
        "name": "New meal name",
        "description": "One sentence description",
        "ingredients": [...]
      }
    }
  ]
}`;
}
