import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 runs on driver adapters rather than a bundled query engine —
// this is the Postgres one. Point it at the *pooled* connection string;
// `directUrl` in schema.prisma is what migrations use instead.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// Prevents hot-reload in dev from spawning a new PrismaClient (and a new
// connection pool) on every file save.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
