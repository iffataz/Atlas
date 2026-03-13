import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import MealPlan from "@/lib/models/MealPlan";

export const runtime = "nodejs";

export async function GET() {
  try {
    const conn = await connectToDatabase();
    const planCount = await MealPlan.countDocuments();

    return NextResponse.json({
      status: "ok",
      connectedTo: conn.name,
      host: conn.host,
      collection: "meal_plans",
      documentCount: planCount,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { status: "error", message },
      { status: 503 }
    );
  }
}
