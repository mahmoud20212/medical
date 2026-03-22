import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (!auth.user) {
    return auth.unauthorizedResponse;
  }

  const { id } = await context.params;
  const memberId = Number(id);

  if (Number.isNaN(memberId)) {
    return NextResponse.json({ error: "Invalid member id." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { name, role } = body;

    const member = await prisma.teamMember.update({
      where: { id: memberId },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(role !== undefined ? { role } : {}),
      },
    });

    return NextResponse.json(member);
  } catch {
    return NextResponse.json({ error: "Failed to update team member." }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (!auth.user) {
    return auth.unauthorizedResponse;
  }

  const { id } = await context.params;
  const memberId = Number(id);

  if (Number.isNaN(memberId)) {
    return NextResponse.json({ error: "Invalid member id." }, { status: 400 });
  }

  try {
    await prisma.teamMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete team member." }, { status: 500 });
  }
}
