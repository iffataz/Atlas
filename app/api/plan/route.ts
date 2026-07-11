import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MealPlan from "@/lib/models/MealPlan";
import { generateMealPlan, LlmResponseError } from "@/lib/llm";
import { aggregateIngredients } from "@/lib/aggregateIngredients";
import { getOwner, attachOwnerCookie } from "@/lib/owner";
import { limitLlmCall } from "@/lib/ratelimit";
import { MealPlanDaysSchema, PreferencesInputSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const owner = getOwner(req);
  try {
    const rl = await limitLlmCall(owner.ownerId);
    if (!rl.success) {
      return attachOwnerCookie(
        NextResponse.json(
          { error: "You've hit the plan-generation limit. Try again later." },
          { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
        ),
        owner
      );
    }

    const body = await req.json().catch(() => null);
    const input = PreferencesInputSchema.safeParse(body ?? {});
    if (!input.success) {
      return attachOwnerCookie(
        NextResponse.json(
          { error: input.error.issues[0]?.message ?? "Invalid request." },
          { status: 400 }
        ),
        owner
      );
    }
    const { preferences, servings } = input.data;

    const parsed = await generateMealPlan(preferences, servings);

    const validated = MealPlanDaysSchema.safeParse(parsed);
    if (!validated.success) {
      return attachOwnerCookie(
        NextResponse.json(
          { error: "Unexpected meal plan structure. Please try again." },
          { status: 502 }
        ),
        owner
      );
    }

    const days = validated.data.days;
    const shoppingList = aggregateIngredients(days);

    await connectDB();
    const plan = await MealPlan.create({
      preferences,
      servings,
      days,
      shoppingList,
      ownerId: owner.ownerId,
    });

    return attachOwnerCookie(
      NextResponse.json({ planId: plan._id.toString(), days, shoppingList }),
      owner
    );
  } catch (err) {
    console.error("POST /api/plan error:", err);
    if (err instanceof LlmResponseError) {
      return attachOwnerCookie(
        NextResponse.json(
          { error: "The meal planner gave an unusable response. Please try again." },
          { status: 502 }
        ),
        owner
      );
    }
    return attachOwnerCookie(
      NextResponse.json({ error: "Failed to generate meal plan." }, { status: 500 }),
      owner
    );
  }
}

export async function GET(req: NextRequest) {
  const owner = getOwner(req);
  try {
    // Brand-new browser: no cookie means no plans can belong to it yet.
    if (owner.isNew) {
      return attachOwnerCookie(NextResponse.json({ plans: [] }), owner);
    }

    await connectDB();
    const plans = await MealPlan.find(
      { ownerId: owner.ownerId },
      { preferences: 1, servings: 1, createdAt: 1 }
    )
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    return NextResponse.json({ plans });
  } catch (err) {
    console.error("GET /api/plan error:", err);
    return attachOwnerCookie(
      NextResponse.json({ error: "Failed to fetch plans." }, { status: 500 }),
      owner
    );
  }
}
