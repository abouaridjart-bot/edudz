import { PrismaClient } from "@prisma/client";

/** عميل Prisma الوحيد في المشروع. لا تستورد PrismaClient من أي مكان آخر. */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
