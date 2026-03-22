import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;
type TeamSort = "latest" | "name";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const sortParam = (searchParams.get("sort") || "latest") as TeamSort;
    const orderParam: "asc" | "desc" = searchParams.get("order") === "asc" ? "asc" : "desc";
    const page = Math.max(Number(searchParams.get("page") || DEFAULT_PAGE), 1);
    const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize") || DEFAULT_PAGE_SIZE), 1), MAX_PAGE_SIZE);
    const skip = (page - 1) * pageSize;

    const where = q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { role: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : undefined;

    const orderBy = sortParam === "name" ? { name: orderParam } : { createdAt: orderParam };

    const [items, total] = await Promise.all([
      prisma.teamMember.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.teamMember.count({ where }),
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
          page: 1,
          pageSize: DEFAULT_PAGE_SIZE,
          total: 0,
          totalPages: 1,
        },
        error: "Failed to load team members.",
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
    const { name, role } = body;

    if (!name || !role) {
      return NextResponse.json({ error: "Invalid team member payload." }, { status: 400 });
    }

    const member = await prisma.teamMember.create({
      data: { name, role },
    });

    return NextResponse.json(member, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create team member." }, { status: 500 });
  }
}
