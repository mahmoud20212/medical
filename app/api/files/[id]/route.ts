import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (!auth.user) {
    return auth.unauthorizedResponse;
  }

  const { id } = await context.params;
  const fileId = Number(id);

  if (Number.isNaN(fileId)) {
    return NextResponse.json({ error: "Invalid file id." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { name, url, fileType } = body;

    const file = await prisma.courseFile.update({
      where: { id: fileId },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(url !== undefined ? { url } : {}),
        ...(fileType !== undefined ? { fileType } : {}),
      },
    });

    return NextResponse.json(file);
  } catch {
    return NextResponse.json({ error: "Failed to update file." }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (!auth.user) {
    return auth.unauthorizedResponse;
  }

  const { id } = await context.params;
  const fileId = Number(id);

  if (Number.isNaN(fileId)) {
    return NextResponse.json({ error: "Invalid file id." }, { status: 400 });
  }

  try {
    await prisma.courseFile.delete({
      where: { id: fileId },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete file." }, { status: 500 });
  }
}
