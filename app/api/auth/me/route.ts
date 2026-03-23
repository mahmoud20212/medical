import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await getAuthSession();

    if (!auth) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user: auth.user });
  } catch (error: unknown) {
    console.error("🔥 ERROR in GET /api/auth/me:", error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
