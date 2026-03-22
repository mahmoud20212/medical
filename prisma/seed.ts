import { PrismaClient, CourseType, CourseFileType } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function getPostgresConnectionString(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set.");
  }

  if (databaseUrl.startsWith("postgresql://") || databaseUrl.startsWith("postgres://")) {
    return databaseUrl;
  }

  if (databaseUrl.startsWith("prisma+postgres://")) {
    const parsedUrl = new URL(databaseUrl);
    const apiKey = parsedUrl.searchParams.get("api_key");

    if (!apiKey) {
      throw new Error("Missing api_key in prisma+postgres DATABASE_URL.");
    }

    const payloadJson = Buffer.from(apiKey, "base64url").toString("utf-8");
    const payload = JSON.parse(payloadJson) as { databaseUrl?: string };

    if (!payload.databaseUrl) {
      throw new Error("databaseUrl was not found in api_key payload.");
    }

    return payload.databaseUrl;
  }

  throw new Error("Unsupported DATABASE_URL format.");
}

const adapter = new PrismaPg({ connectionString: getPostgresConnectionString() });
const prisma = new PrismaClient({ adapter });

const courses = [
  {
    id: 1,
    name: "علم التشريح",
    description: "دراسة تفصيلية لتشريح جسم الإنسان من الناحية الوصفية والوظيفية",
    year: 1,
    semester: "الأول",
    type: CourseType.basic,
    createdAt: new Date("2024-09-01T00:00:00Z"),
  },
  {
    id: 2,
    name: "علم وظائف الأعضاء",
    description: "دراسة وظائف الأجهزة الحيوية في جسم الإنسان",
    year: 1,
    semester: "الثاني",
    type: CourseType.basic,
    createdAt: new Date("2024-09-01T00:00:00Z"),
  },
  {
    id: 3,
    name: "الكيمياء الحيوية",
    description: "دراسة التفاعلات الكيميائية في الكائنات الحية",
    year: 1,
    semester: "الأول",
    type: CourseType.basic,
    createdAt: new Date("2024-09-01T00:00:00Z"),
  },
  {
    id: 4,
    name: "علم الأمراض",
    description: "دراسة أسباب الأمراض وآليات حدوثها",
    year: 2,
    semester: "الأول",
    type: CourseType.basic,
    createdAt: new Date("2024-09-01T00:00:00Z"),
  },
  {
    id: 5,
    name: "الأمراض الداخلية",
    description: "تشخيص وعلاج أمراض الأجهزة الداخلية",
    year: 3,
    semester: "الأول",
    type: CourseType.clinical,
    createdAt: new Date("2024-09-01T00:00:00Z"),
  },
  {
    id: 6,
    name: "الجراحة العامة",
    description: "مبادئ الجراحة وأسسها العملية والنظرية",
    year: 3,
    semester: "الثاني",
    type: CourseType.clinical,
    createdAt: new Date("2024-09-01T00:00:00Z"),
  },
  {
    id: 7,
    name: "طب الأطفال",
    description: "تشخيص وعلاج أمراض الأطفال",
    year: 4,
    semester: "الأول",
    type: CourseType.clinical,
    createdAt: new Date("2024-09-01T00:00:00Z"),
  },
  {
    id: 8,
    name: "طب النساء والتوليد",
    description: "رعاية صحة المرأة والحمل والولادة",
    year: 4,
    semester: "الثاني",
    type: CourseType.clinical,
    createdAt: new Date("2024-09-01T00:00:00Z"),
  },
];

const files = [
  {
    id: 1,
    courseId: 1,
    name: "محاضرة 1 - مقدمة في التشريح",
    url: "#",
    fileType: CourseFileType.pdf,
    uploadedAt: new Date("2024-09-10T00:00:00Z"),
  },
  {
    id: 2,
    courseId: 1,
    name: "محاضرة 2 - الجهاز العظمي",
    url: "#",
    fileType: CourseFileType.ppt,
    uploadedAt: new Date("2024-09-17T00:00:00Z"),
  },
  {
    id: 3,
    courseId: 1,
    name: "فيديو شرح الأطراف",
    url: "#",
    fileType: CourseFileType.video,
    uploadedAt: new Date("2024-09-20T00:00:00Z"),
  },
  {
    id: 4,
    courseId: 2,
    name: "محاضرة 1 - فسيولوجيا القلب",
    url: "#",
    fileType: CourseFileType.pdf,
    uploadedAt: new Date("2024-09-10T00:00:00Z"),
  },
  {
    id: 5,
    courseId: 5,
    name: "ملخص الأمراض الداخلية",
    url: "#",
    fileType: CourseFileType.doc,
    uploadedAt: new Date("2024-10-01T00:00:00Z"),
  },
  {
    id: 6,
    courseId: 6,
    name: "دليل الجراحة - الجزء الأول",
    url: "#",
    fileType: CourseFileType.pdf,
    uploadedAt: new Date("2024-10-05T00:00:00Z"),
  },
];

const teamMembers = [
  { id: 1, name: "محمد أحمد", role: "مطور الموقع" },
  { id: 2, name: "سارة خالد", role: "مديرة المحتوى" },
  { id: 3, name: "عمر حسن", role: "مصمم الجرافيك" },
  { id: 4, name: "ليلى يوسف", role: "منسقة المساقات" },
];

async function main() {
  await prisma.courseFile.deleteMany();
  await prisma.course.deleteMany();
  await prisma.teamMember.deleteMany();

  await prisma.course.createMany({ data: courses });
  await prisma.courseFile.createMany({ data: files });
  await prisma.teamMember.createMany({ data: teamMembers });

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
