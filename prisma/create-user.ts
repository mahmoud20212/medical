import "dotenv/config";
import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { PrismaClient } from "@prisma/client";
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

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

function parseArg(flag: string): string | undefined {
  const args = process.argv.slice(2);
  const key = `--${flag}`;
  const index = args.findIndex((item) => item === key);

  if (index === -1) {
    return undefined;
  }

  const value = args[index + 1];
  return value && !value.startsWith("--") ? value : undefined;
}

async function promptValue(rl: ReturnType<typeof createInterface>, label: string, initial?: string): Promise<string> {
  if (initial && initial.trim()) {
    return initial.trim();
  }

  const value = await rl.question(`${label}: `);
  return value.trim();
}

async function main() {
  const adapter = new PrismaPg({ connectionString: resolvePostgresUrl() });
  const prisma = new PrismaClient({ adapter });
  const rl = createInterface({ input, output });

  try {
    const username = await promptValue(rl, "Username", parseArg("username"));
    const email = (await promptValue(rl, "Email", parseArg("email"))).toLowerCase();
    const password = await promptValue(rl, "Password", parseArg("password"));

    if (!username || username.length < 3) {
      throw new Error("Username must be at least 3 characters.");
    }

    if (!email || !email.includes("@")) {
      throw new Error("A valid email is required.");
    }

    if (!password || password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
      select: { id: true },
    });

    if (existing) {
      throw new Error("User already exists with this username or email.");
    }

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: hashPassword(password),
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    console.log("User created successfully:", user);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  const dbError = error as { code?: string; message?: string };
  const message = dbError?.message ?? String(error);

  if (dbError?.code === "P2021" || message.includes("public.User") || message.includes("does not exist")) {
    console.error("Failed to create user: auth tables are missing.");
    console.error("Run this first: npx.cmd prisma migrate dev -n add_auth_models");
    process.exit(1);
  }

  if (dbError?.code === "P1000" || message.includes("Authentication failed")) {
    console.error("Failed to create user: database credentials are invalid.");
    console.error("Set a valid DATABASE_URL in .env, then retry.");
    process.exit(1);
  }

  console.error("Failed to create user:", message);
  process.exit(1);
});
