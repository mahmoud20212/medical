import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [yearsRaw, semestersRaw, basicCount, clinicalCount, totalCount] = await Promise.all([
      prisma.course.findMany({
        distinct: ["year"],
        select: { year: true },
        orderBy: { year: "asc" },
      }),
      prisma.course.findMany({
        distinct: ["semester"],
        select: { semester: true },
        orderBy: { semester: "asc" },
      }),
      prisma.course.count({ where: { type: "basic" } }),
      prisma.course.count({ where: { type: "clinical" } }),
      prisma.course.count(),
    ]);

    return NextResponse.json({
      years: yearsRaw.map((item) => item.year),
      semesters: semestersRaw.map((item) => item.semester),
      counts: {
        all: totalCount,
        basic: basicCount,
        clinical: clinicalCount,
      },
    });
  } catch {
    return NextResponse.json(
      {
        years: [],
        semesters: [],
        counts: {
          all: 0,
          basic: 0,
          clinical: 0,
        },
        error: "Failed to load courses metadata.",
      },
      { status: 500 }
    );
  }
}
