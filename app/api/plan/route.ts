import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MealPlan from "@/lib/models/MealPlan";
import { generateMealPlan } from "@/lib/llm";
import { aggregateIngredients } from "@/lib/aggregateIngredients";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const preferences: string = (body.preferences ?? "").trim().slice(0, 500);
    const servings: number = Math.min(Math.max(Number(body.servings) || 2, 1), 20);

    if (!preferences) {
      return NextResponse.json({ error: "Preferences are required." }, { status: 400 });
    }

    const parsed = await generateMealPlan(preferences, servings);

    if (!Array.isArray(parsed.days) || parsed.days.length !== 7) {
      return NextResponse.json(
        { error: "Unexpected meal plan structure. Please try again." },
        { status: 502 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const days = parsed.days as any[];
    const shoppingList = aggregateIngredients(days);

    await connectDB();
    const plan = await MealPlan.create({ preferences, servings, days, shoppingList });

    return NextResponse.json({ planId: plan._id.toString(), days, shoppingList });
  } catch (err) {
    console.error("POST /api/plan error:", err);
    return NextResponse.json({ error: "Failed to generate meal plan." }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const plans = await MealPlan.find({}, { preferences: 1, servings: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    return NextResponse.json({ plans });
  } catch (err) {
    console.error("GET /api/plan error:", err);
    return NextResponse.json({ error: "Failed to fetch plans." }, { status: 500 });
  }
}
