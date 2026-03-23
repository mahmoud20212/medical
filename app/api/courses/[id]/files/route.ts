import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;
type FileSort = "latest" | "name";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const courseId = Number(id);

  if (Number.isNaN(courseId)) {
    return NextResponse.json({ error: "Invalid course id." }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const sortParam = (searchParams.get("sort") || "latest") as FileSort;
  const orderParam: "asc" | "desc" = searchParams.get("order") === "asc" ? "asc" : "desc";
  const page = Math.max(Number(searchParams.get("page") || DEFAULT_PAGE), 1);
  const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize") || DEFAULT_PAGE_SIZE), 1), MAX_PAGE_SIZE);
  const skip = (page - 1) * pageSize;

  try {
    const where = {
      courseId,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { url: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const orderBy = sortParam === "name" ? { name: orderParam } : { uploadedAt: orderParam };

    const [items, total] = await Promise.all([
      prisma.courseFile.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.courseFile.count({ where }),
    ]);

    return NextResponse.json({
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(Math.ceil(total / pageSize), 1),
      },
    });
  } catch {
    return NextResponse.json(
      {
        items: [],
        pagination: {
          page,
          pageSize,
          total: 0,
          totalPages: 1,
        },
        error: "Failed to load course files.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
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
    const { name, url, fileType } = body;

    if (!name || !url || !fileType) {
      return NextResponse.json({ error: "Invalid file payload." }, { status: 400 });
    }

    const file = await prisma.courseFile.create({
      data: {
        courseId,
        name,
        url,
        fileType,
      },
    });

    return NextResponse.json(file, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create file." }, { status: 500 });
  }
}
