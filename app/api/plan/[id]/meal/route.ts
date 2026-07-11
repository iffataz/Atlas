import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import MealPlan from "@/lib/models/MealPlan";
import { regenerateMeal, LlmResponseError } from "@/lib/llm";
import { aggregateIngredients } from "@/lib/aggregateIngredients";
import { getOwner } from "@/lib/owner";
import { limitLlmCall } from "@/lib/ratelimit";
import { MealSchema, MealSwapInputSchema } from "@/lib/schemas";
import { logError } from "@/lib/log";

export const runtime = "nodejs";

// Regenerates one meal in place — much cheaper than a full-plan refinement
// when the user just wants a different Tuesday dinner.
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json({ error: "Invalid plan id." }, { status: 400 });
    }

    const owner = getOwner(req);
    const rl = await limitLlmCall(owner.ownerId);
    if (!rl.success) {
      return NextResponse.json(
        { error: "You've hit the plan-generation limit. Try again later." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
      );
    }

    const body = await req.json().catch(() => null);
    const input = MealSwapInputSchema.safeParse(body ?? {});
    if (!input.success) {
      return NextResponse.json(
        { error: input.error.issues[0]?.message ?? "Invalid request." },
        { status: 400 }
      );
    }
    const { day, mealType } = input.data;

    await connectDB();
    const plan = await MealPlan.findById(params.id);
    if (!plan || (plan.ownerId && plan.ownerId !== owner.ownerId)) {
      return NextResponse.json({ error: "Plan not found." }, { status: 404 });
    }

    const dayIdx = plan.days.findIndex(
      (d) => d.day.toLowerCase() === day.toLowerCase()
    );
    if (dayIdx === -1) {
      return NextResponse.json({ error: "Day not found in plan." }, { status: 400 });
    }

    const currentMeal = plan.days[dayIdx][mealType];
    const parsed = await regenerateMeal({
      day: plan.days[dayIdx].day,
      mealType,
      currentMeal: { name: currentMeal.name, description: currentMeal.description },
      preferences: plan.preferences,
      servings: plan.servings,
    });

    const validated = MealSchema.safeParse(parsed);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Unexpected meal structure. Please try again." },
        { status: 502 }
      );
    }

    plan.set(`days.${dayIdx}.${mealType}`, validated.data);
    // aggregateIngredients spreads each ingredient, which drops the
    // getter-backed fields of mongoose subdocuments — use plain objects.
    const plainDays = plan.toObject().days;
    plan.shoppingList = aggregateIngredients(plainDays);
    await plan.save();

    return NextResponse.json({
      planId: plan._id.toString(),
      days: plainDays,
      shoppingList: plan.shoppingList,
    });
  } catch (err) {
    logError("POST /api/plan/[id]/meal", err);
    if (err instanceof LlmResponseError) {
      return NextResponse.json(
        { error: "The meal planner gave an unusable response. Please try again." },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: "Failed to swap meal." }, { status: 500 });
  }
}
