import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MealPlan from "@/lib/models/MealPlan";
import { geminiFlash, buildRefinementPrompt } from "@/lib/gemini";
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

    const prompt = buildRefinementPrompt(
      { days: plan.days },
      instruction,
      plan.servings
    );
    const result = await geminiFlash.generateContent(prompt);
    const raw = result.response.text();

    let parsed: { days: unknown[] };
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Gemini returned invalid JSON. Please try again." },
        { status: 502 }
      );
    }

    if (!Array.isArray(parsed.days)) {
      return NextResponse.json(
        { error: "Unexpected refinement structure from Gemini." },
        { status: 502 }
      );
    }

    // Merge modified days into existing plan
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedDays = plan.days.map((existingDay: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const modifiedDay = (parsed.days as any[]).find(
        (d) => d.day?.toLowerCase() === existingDay.day?.toLowerCase()
      );
      return modifiedDay ?? existingDay;
    });

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
