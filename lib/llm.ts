import Groq from "groq-sdk";

// Lazy singleton — avoids "missing API key" error during Next.js build
let _groq: Groq | null = null;
function getGroq(): Groq {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
}

const MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

// JSON Schema — Llama 4 Scout supports json_schema response format (best-effort)
const MEAL_PLAN_SCHEMA = {
  type: "object" as const,
  properties: {
    days: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          day:       { type: "string" as const },
          breakfast: { $ref: "#/$defs/meal" },
          lunch:     { $ref: "#/$defs/meal" },
          dinner:    { $ref: "#/$defs/meal" },
        },
        required: ["day", "breakfast", "lunch", "dinner"],
      },
    },
  },
  required: ["days"],
  $defs: {
    meal: {
      type: "object" as const,
      properties: {
        name:        { type: "string" as const },
        description: { type: "string" as const },
        ingredients: {
          type: "array" as const,
          items: {
            type: "object" as const,
            properties: {
              name:     { type: "string" as const },
              quantity: { type: "number" as const },
              unit:     { type: "string" as const },
              category: {
                type: "string" as const,
                enum: ["Produce", "Proteins", "Dairy", "Grains", "Pantry", "Frozen", "Other"],
              },
            },
            required: ["name", "quantity", "unit", "category"],
          },
        },
      },
      required: ["name", "description", "ingredients"],
    },
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function callGroq(prompt: string): Promise<any> {
  const completion = await getGroq().chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 8192,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "meal_plan",
        schema: MEAL_PLAN_SCHEMA,
      },
    },
  });
  return JSON.parse(completion.choices[0].message.content!);
}

export function generateMealPlan(preferences: string, servings: number) {
  return callGroq(buildMealPlanPrompt(preferences, servings));
}

export function refineMealPlan(
  existingPlan: object,
  instruction: string,
  servings: number
) {
  return callGroq(buildRefinementPrompt(existingPlan, instruction, servings));
}

function buildMealPlanPrompt(preferences: string, servings: number): string {
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
          { "name": "ingredient name", "quantity": 2, "unit": "cup", "category": "Produce" }
        ]
      },
      "lunch": { "name": "...", "description": "...", "ingredients": [...] },
      "dinner": { "name": "...", "description": "...", "ingredients": [...] }
    }
  ]
}

Rules:
- Include exactly 7 days: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
- Scale ingredient quantities for ${servings} serving(s)
- Ingredient "name" must be singular and lowercase (e.g. "egg" not "eggs", "tomato" not "tomatoes")
- "unit" must be one of: g, kg, ml, L, cup, tbsp, tsp, piece, slice, clove, bunch, can, or "whole"
- "category" must be exactly one of: Produce, Proteins, Dairy, Grains, Pantry, Frozen, Other
- "quantity" must be a number (not a string)
- Vary cuisines and ingredients across the week for nutritional balance
- Strictly respect the user's dietary preferences and restrictions`;
}

function buildRefinementPrompt(
  existingPlan: object,
  instruction: string,
  servings: number
): string {
  return `You are a meal planning assistant. The user wants to modify their existing meal plan.

Instruction: "${instruction}"
Servings per meal: ${servings}

Current meal plan:
${JSON.stringify(existingPlan, null, 2)}

Return the complete 7-day meal plan with the requested changes applied. Keep all unaffected days and meals identical to the current plan. Follow the same rules:
- Ingredient "name": singular lowercase
- "unit": g, kg, ml, L, cup, tbsp, tsp, piece, slice, clove, bunch, can, or "whole"
- "category": one of Produce, Proteins, Dairy, Grains, Pantry, Frozen, Other
- "quantity": a number`;
}
