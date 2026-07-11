import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

// Anonymous per-browser identity — not authentication. Plans are scoped to
// this cookie so history stays private per browser; direct plan links still
// work for anyone holding the (unguessable) ObjectId.
const COOKIE_NAME = "atlas_uid";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
const VALID_ID = /^[A-Za-z0-9-]{8,64}$/;

export interface OwnerContext {
  ownerId: string;
  isNew: boolean;
}

export function getOwner(req: NextRequest): OwnerContext {
  const existing = req.cookies.get(COOKIE_NAME)?.value;
  if (existing && VALID_ID.test(existing)) {
    return { ownerId: existing, isNew: false };
  }
  return { ownerId: randomUUID(), isNew: true };
}

export function attachOwnerCookie<T extends NextResponse>(
  res: T,
  owner: OwnerContext
): T {
  if (owner.isNew) {
    res.cookies.set(COOKIE_NAME, owner.ownerId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: ONE_YEAR_SECONDS,
      path: "/",
    });
  }
  return res;
}
