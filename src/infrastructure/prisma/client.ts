import { env } from "../../shared/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma";

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 0,
    connectionTimeoutMillis: 5000,
  });
  return new PrismaClient({ adapter });
}

let prisma = createPrismaClient();

export function resetPrismaClient() {
  prisma.$disconnect().catch(() => {});
  prisma = createPrismaClient();
}

export { prisma };
