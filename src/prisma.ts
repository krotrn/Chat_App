/**
 * Initializes a PrismaClient instance and assigns it to a global variable.
 * This ensures that a single instance of PrismaClient is used throughout the application,
 * preventing the creation of multiple instances which can lead to performance issues.
 *
 * The `db` constant is assigned the existing global PrismaClient instance if it exists,
 * otherwise, a new PrismaClient instance is created.
 *
 * In non-production environments, the PrismaClient instance is assigned to the global
 * variable to maintain a single instance across module reloads.
 *
 * @module prisma
 * @see {@link https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client Prisma Client Documentation}
 */
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
