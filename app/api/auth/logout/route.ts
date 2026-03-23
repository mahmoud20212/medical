import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearSessionCookie, deleteSessionByToken } from "@/lib/auth";

const AUTH_COOKIE_NAME = "medical_session";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (token) {
      await deleteSessionByToken(token).catch(() => null);
    }

    const response = NextResponse.json({ success: true });
    clearSessionCookie(response);
    return response;
  } catch (error: unknown) {
    console.error("🔥 ERROR in POST /api/auth/logout:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
