import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, getAuthSession, hashPassword, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const auth = await getAuthSession();
    const usersCount = await prisma.user.count();
    const canBootstrap = usersCount === 0;

    if (!auth && !canBootstrap) {
      return NextResponse.json({ error: "إنشاء الحسابات متاح فقط من لوحة الإدارة." }, { status: 403 });
    }

    const body = await request.json();
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!username || username.length < 3) {
      return NextResponse.json({ error: "اسم المستخدم يجب أن يكون 3 أحرف على الأقل." }, { status: 400 });
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "البريد الإلكتروني غير صالح." }, { status: 400 });
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل." }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({ error: "اسم المستخدم أو البريد الإلكتروني مستخدم مسبقاً." }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: hashPassword(password),
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    if (auth) {
      return NextResponse.json({ user }, { status: 201 });
    }

    const { token, expiresAt } = await createSession(user.id);
    const response = NextResponse.json({ user }, { status: 201 });
    await setSessionCookie(response, token, expiresAt);
    return response;
  } catch {
    return NextResponse.json({ error: "تعذر إنشاء الحساب." }, { status: 500 });
  }
}
