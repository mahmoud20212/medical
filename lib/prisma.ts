import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function resolvePostgresUrl(): string {
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

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: resolvePostgresUrl() });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
