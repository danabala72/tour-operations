import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/lib/generated/prisma/client";

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  ssl: true,
});

function convertPrismaValues(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // BigInt -> Number
  if (typeof obj === "bigint") {
    return Number(obj);
  }

  // Date / MySQL DATE / TIME / DATETIME
  if (obj instanceof Date) {
    return obj;
  }

  // Prisma Decimal
  if (
    typeof obj === "object" &&
    obj !== null &&
    "toNumber" in obj &&
    typeof (obj as { toNumber?: unknown }).toNumber === "function"
  ) {
    return (obj as { toNumber: () => number }).toNumber();
  }

  if (Array.isArray(obj)) {
    return obj.map(convertPrismaValues);
  }

  if (typeof obj === "object") {
    const target = obj as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(target)) {
      result[key] = convertPrismaValues(target[key]);
    }

    return result;
  }

  return obj;
}

export const db = new PrismaClient({ adapter }).$extends({
  query: {
    $allOperations: async ({ args, query }) => {
      const result = await query(args);
      return convertPrismaValues(result);
    },
  },
});
