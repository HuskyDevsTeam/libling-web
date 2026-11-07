import "server-only"
import { PrismaClient } from "@prisma/client"

// Un unico cliente de Prisma por proceso (en desarrollo se conserva entre recargas)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
