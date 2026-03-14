import Groq from "groq-sdk";

// Lazy singleton — avoids "missing API key" error during Next.js build
let _groq: Groq | null = null;
function getGroq(): Groq {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
}

const MODEL = "llama-3.3-70b-versatile";

// JSON Schema for Groq strict mode — guarantees schema-compliant response
const MEAL_PLAN_JSON_SCHEMA = {
  type: "object",
  properties: {
    days: {
      type: "array",
      items: {
        type: "object",
        properties: {
          day:       { type: "string" },
          breakfast: { $ref: "#/$defs/meal" },
          lunch:     { $ref: "#/$defs/meal" },
          dinner:    { $ref: "#/$defs/meal" },
        },
        required: ["day", "breakfast", "lunch", "dinner"],
        additionalProperties: false,
      },
    },
  },
  required: ["days"],
  additionalProperties: false,
  $defs: {
    meal: {
      type: "object",
      properties: {
        name:        { type: "string" },
        description: { type: "string" },
        ingredients: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name:     { type: "string" },
              quantity: { type: "number" },
              unit:     { type: "string" },
              category: {
                type: "string",
                enum: ["Produce", "Proteins", "Dairy", "Grains", "Pantry", "Frozen", "Other"],
              },
            },
            required: ["name", "quantity", "unit", "category"],
            additionalProperties: false,
          },
        },
      },
      required: ["name", "description", "ingredients"],
      additionalProperties: false,
    },
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function callGroq(prompt: string): Promise<any> {
  const completion = await getGroq().chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "meal_plan",
        schema: MEAL_PLAN_JSON_SCHEMA,
        strict: true,
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

Rules:
- Include exactly 7 days: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
- Scale ingredient quantities for ${servings} serving(s)
- Ingredient "name" must be singular and lowercase (e.g. "egg" not "eggs", "tomato" not "tomatoes")
- "unit" must be a standard cooking unit: g, kg, ml, L, cup, tbsp, tsp, piece, slice, clove, bunch, can, or "whole"
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
