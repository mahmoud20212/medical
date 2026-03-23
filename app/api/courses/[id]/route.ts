import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (!auth.user) {
    return auth.unauthorizedResponse;
  }

  const { id } = await context.params;
  const courseId = Number(id);

  if (Number.isNaN(courseId)) {
    return NextResponse.json({ error: "Invalid course id." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { name, description, year, semester, type } = body;

    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description: description || null } : {}),
        ...(year !== undefined ? { year } : {}),
        ...(semester !== undefined ? { semester } : {}),
        ...(type !== undefined ? { type } : {}),
      },
      include: {
        files: {
          orderBy: { uploadedAt: "desc" },
        },
      },
    });

    return NextResponse.json(course);
  } catch (error: unknown) {
    console.error("🔥 ERROR in PATCH /api/courses/[id]:", error);
    const message = error instanceof Error ? error.message : "Failed to update course.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (!auth.user) {
    return auth.unauthorizedResponse;
  }

  const { id } = await context.params;
  const courseId = Number(id);

  if (Number.isNaN(courseId)) {
    return NextResponse.json({ error: "Invalid course id." }, { status: 400 });
  }

  try {
    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("🔥 ERROR in DELETE /api/courses/[id]:", error);
    const message = error instanceof Error ? error.message : "Failed to delete course.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
