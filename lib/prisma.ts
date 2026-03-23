import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function resolvePostgresUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set.");
  }

  if (databaseUrl.startsWith("postgresql://") || databaseUrl.startsWith("postgres://")) {
    const parsed = new URL(databaseUrl);
    const isLocal = ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
    const isSupabasePooler = parsed.hostname.includes("pooler.supabase.com");
    const isProduction = process.env.NODE_ENV === "production";

    if (!isLocal && !parsed.searchParams.has("sslmode")) {
      // In local development networks, certificate chains may be re-signed by proxies.
      // Keep production strict, but make dev resilient.
      parsed.searchParams.set("sslmode", isProduction ? "verify-full" : "no-verify");
    }

    if (isSupabasePooler && !parsed.searchParams.has("pgbouncer")) {
      parsed.searchParams.set("pgbouncer", "true");
    }

    if (isSupabasePooler && !parsed.searchParams.has("connection_limit")) {
      parsed.searchParams.set("connection_limit", "1");
    }

    return parsed.toString();
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
