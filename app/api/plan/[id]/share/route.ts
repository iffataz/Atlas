import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import MealPlan from "@/lib/models/MealPlan";
import { getOwner } from "@/lib/owner";
import { logError } from "@/lib/log";

export const runtime = "nodejs";

// Returns the plan's read-only share token, creating it on first share.
// The token (not the ObjectId) goes in the link, since ObjectIds are partly
// sequential and an _id link would let anyone walk to neighbouring plans.
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json({ error: "Invalid plan id." }, { status: 400 });
    }

    await connectDB();
    const plan = await MealPlan.findById(params.id);
    const ownerId = getOwner(req).ownerId;
    if (!plan || (plan.ownerId && plan.ownerId !== ownerId)) {
      return NextResponse.json({ error: "Plan not found." }, { status: 404 });
    }

    if (!plan.shareId) {
      plan.shareId = randomBytes(16).toString("base64url");
      await plan.save();
    }
    return NextResponse.json({ shareId: plan.shareId });
  } catch (err) {
    logError("POST /api/plan/[id]/share", err);
    return NextResponse.json({ error: "Failed to create share link." }, { status: 500 });
  }
}
