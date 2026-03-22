import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearSessionCookie, deleteSessionByToken } from "@/lib/auth";

const AUTH_COOKIE_NAME = "medical_session";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (token) {
    await deleteSessionByToken(token).catch(() => null);
  }

  const response = NextResponse.json({ success: true });
  clearSessionCookie(response);
  return response;
}
