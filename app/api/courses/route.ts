import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CourseType } from "@prisma/client";
import { requireAuth } from "@/lib/auth";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 6;
const MAX_PAGE_SIZE = 50;
type CourseSort = "latest" | "name" | "year";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const typeParam = searchParams.get("type");
  const yearParam = searchParams.get("year");
  const semesterParam = searchParams.get("semester");
  const includeFiles = searchParams.get("includeFiles") !== "false";
  const sortParam = (searchParams.get("sort") || "year") as CourseSort;
  const orderParam: "asc" | "desc" = searchParams.get("order") === "desc" ? "desc" : "asc";

  const page = Math.max(Number(searchParams.get("page") || DEFAULT_PAGE), 1);
  const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize") || DEFAULT_PAGE_SIZE), 1), MAX_PAGE_SIZE);
  const skip = (page - 1) * pageSize;

  try {
    const where = {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { description: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(typeParam && typeParam !== "all" ? { type: typeParam as CourseType } : {}),
      ...(yearParam && yearParam !== "all" ? { year: Number(yearParam) } : {}),
      ...(semesterParam && semesterParam !== "all" ? { semester: semesterParam } : {}),
    };

    const orderBy =
      sortParam === "latest"
        ? [{ createdAt: orderParam }]
        : sortParam === "name"
          ? [{ name: orderParam }]
          : [
              { year: orderParam },
              { semester: orderParam },
              { name: "asc" as const },
            ];

    const [items, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: includeFiles
          ? {
              files: {
                orderBy: { uploadedAt: "desc" },
              },
            }
          : undefined,
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.course.count({ where }),
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
  } catch (error: unknown) {
    console.error("🔥 ERROR in GET /api/courses:", error);
    const message = error instanceof Error ? error.message : "Failed to load courses.";
    return NextResponse.json(
      {
        success: false,
        items: [],
        pagination: { page, pageSize, total: 0, totalPages: 1 },
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.user) {
    return auth.unauthorizedResponse;
  }

  try {
    const body = await request.json();
    const { name, description, year, semester, type } = body;
    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedSemester = typeof semester === "string" ? semester.trim() : "";

    if (!normalizedName || !normalizedSemester || !type || typeof year !== "number" || !Number.isFinite(year) || year < 1) {
      return NextResponse.json({ error: "Invalid course payload." }, { status: 400 });
    }

    const course = await prisma.course.create({
      data: {
        name: normalizedName,
        description: description || null,
        year,
        semester: normalizedSemester,
        type,
      },
    include: {
      files: {
        orderBy: { uploadedAt: "desc" },
      },
    },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error: unknown) {
    console.error("🔥 ERROR in POST /api/courses:", error);
    const dbError = error as { code?: string; message?: string };
    const message = dbError?.message ?? "";

    if (dbError?.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "هذا المساق موجود مسبقاً بنفس السنة والفصل والنوع." },
        { status: 409 }
      );
    }

    if (dbError?.code === "ECONNREFUSED" || message.includes("ECONNREFUSED")) {
      return NextResponse.json(
        { success: false, error: "تعذر الاتصال بقاعدة البيانات. تأكد من تشغيلها وإعداد DATABASE_URL بشكل صحيح." },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: false, error: message || "Failed to create course." }, { status: 500 });
  }
}
