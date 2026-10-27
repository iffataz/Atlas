import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MealPlan from "@/lib/models/MealPlan";
import { logError } from "@/lib/log";

export const runtime = "nodejs";

// 16 random bytes, base64url-encoded (see POST /api/plan/[id]/share).
const VALID_SHARE_ID = /^[A-Za-z0-9_-]{22}$/;

// Read-only view of a shared plan for anyone holding the link. Only the
// fields needed to render it are returned — never ownerId or _id.
export async function GET(
  _req: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    if (!VALID_SHARE_ID.test(params.shareId)) {
      return NextResponse.json({ error: "Shared plan not found." }, { status: 404 });
    }

    await connectDB();
    const plan = await MealPlan.findOne(
      { shareId: params.shareId },
      { _id: 0, preferences: 1, servings: 1, days: 1, shoppingList: 1, createdAt: 1 }
    ).lean();
    if (!plan) {
      return NextResponse.json({ error: "Shared plan not found." }, { status: 404 });
    }
    return NextResponse.json(plan);
  } catch (err) {
    logError("GET /api/share/[shareId]", err);
    return NextResponse.json({ error: "Failed to fetch shared plan." }, { status: 500 });
  }
}
