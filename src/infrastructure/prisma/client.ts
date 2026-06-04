import { env } from "../../shared/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma";
import pg from "pg";

function createPrismaClient() {
  const pool = new pg.Pool({
    connectionString: env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 0,
    connectionTimeoutMillis: 5000,
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

let prisma = createPrismaClient();

export function resetPrismaClient() {
  prisma.$disconnect().catch(() => {});
  prisma = createPrismaClient();
}

export { prisma };
