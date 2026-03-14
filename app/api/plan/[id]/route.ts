import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MealPlan from "@/lib/models/MealPlan";
import { refineMealPlan } from "@/lib/llm";
import { aggregateIngredients } from "@/lib/aggregateIngredients";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const plan = await MealPlan.findById(params.id).lean();
    if (!plan) {
      return NextResponse.json({ error: "Plan not found." }, { status: 404 });
    }
    return NextResponse.json(plan);
  } catch (err) {
    console.error("GET /api/plan/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch plan." }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const instruction: string = (body.instruction ?? "").trim().slice(0, 500);

    if (!instruction) {
      return NextResponse.json({ error: "Instruction is required." }, { status: 400 });
    }

    await connectDB();
    const plan = await MealPlan.findById(params.id);
    if (!plan) {
      return NextResponse.json({ error: "Plan not found." }, { status: 404 });
    }

    // Groq returns all 7 days — no merge logic needed
    const parsed = await refineMealPlan({ days: plan.days }, instruction, plan.servings);

    if (!Array.isArray(parsed.days) || parsed.days.length !== 7) {
      return NextResponse.json(
        { error: "Unexpected refinement structure. Please try again." },
        { status: 502 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedDays = parsed.days as any[];
    const shoppingList = aggregateIngredients(updatedDays);
    plan.days = updatedDays;
    plan.shoppingList = shoppingList;
    await plan.save();

    return NextResponse.json({ planId: plan._id.toString(), days: updatedDays, shoppingList });
  } catch (err) {
    console.error("POST /api/plan/[id] error:", err);
    return NextResponse.json({ error: "Failed to refine meal plan." }, { status: 500 });
  }
}
