import { db } from "@/prisma";

export async function checkDB() {
  try {
    await db.$queryRaw`SELECT 1`;
    return { status: "ok", message: "Database connection is healthy" };
  } catch (error) {
    console.error("Database health check failed:", error);
    return { status: "error", message: "Database connection failed" }
  }
}