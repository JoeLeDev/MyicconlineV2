import { NextResponse } from "next/server";
import { clearAuthTokenCookie } from "@/lib/auth/session";

export async function POST() {
  await clearAuthTokenCookie();
  return NextResponse.json({ ok: true });
}
