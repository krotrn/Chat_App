"use server";

import { db } from "@/prisma";
import { createHealthResponse } from "../../types/response-types";
import { handleActionError } from "../../lib/utils/utils";

export async function checkDB() {
  try {
    await db.$queryRaw`SELECT 1`;

    const userCount = await db.user.count();

    return createHealthResponse(
      "ok",
      `Database connection is healthy. ${userCount} users in system.`
    );
  } catch (error) {
    const errorMessage = handleActionError(error, "Database connection failed");
    console.error("Database health check failed:", errorMessage);

    return createHealthResponse("error", errorMessage);
  }
}

export async function checkEnvironment() {
  try {
    const requiredEnvVars = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];

    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
      return createHealthResponse(
        "error",
        `Missing environment variables: ${missingVars.join(", ")}`
      );
    }

    return createHealthResponse(
      "ok",
      "All required environment variables are configured"
    );
  } catch (error) {
    const errorMessage = handleActionError(error, "Environment check failed");
    console.error("Environment health check failed:", errorMessage);

    return createHealthResponse("error", errorMessage);
  }
}

export async function checkSystemHealth() {
  try {
    const [dbHealth, envHealth] = await Promise.allSettled([
      checkDB(),
      checkEnvironment(),
    ]);

    const results = {
      database:
        dbHealth.status === "fulfilled"
          ? dbHealth.value
          : { status: "error", message: "DB check failed" },
      environment:
        envHealth.status === "fulfilled"
          ? envHealth.value
          : { status: "error", message: "Env check failed" },
    };

    const allHealthy = Object.values(results).every(
      (result) => result.status === "ok"
    );

    return {
      status: allHealthy ? "ok" : "error",
      message: allHealthy
        ? "All systems operational"
        : "Some systems have issues",
      details: results,
    };
  } catch (error) {
    const errorMessage = handleActionError(error, "System health check failed");
    console.error("System health check failed:", errorMessage);

    return createHealthResponse("error", errorMessage);
  }
}
