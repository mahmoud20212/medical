import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = typeof body.identifier === "string" ? body.identifier.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!identifier || !password) {
      return NextResponse.json({ error: "الرجاء إدخال البريد/اسم المستخدم وكلمة المرور." }, { status: 400 });
    }

    const normalizedIdentifier = identifier.toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: normalizedIdentifier }],
      },
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
      },
    });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة." }, { status: 401 });
    }

    const { token, expiresAt } = await createSession(user.id);

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
      { status: 200 }
    );

    await setSessionCookie(response, token, expiresAt);
    return response;
  } catch (error: unknown) {
    console.error("🔥 ERROR in POST /api/auth/login:", error);
    const message = error instanceof Error ? error.message : "تعذر تسجيل الدخول.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
