import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET() {
  try {
    const conn = await connectToDatabase();
    return NextResponse.json({
      status: "ok",
      db: conn.readyState === 1 ? "connected" : "disconnected",
      host: conn.host,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err.message, code: err.code },
      { status: 503 }
    );
  }
}
