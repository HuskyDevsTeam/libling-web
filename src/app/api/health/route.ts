import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

export const dynamic = "force-dynamic"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export async function GET() {
	try {
		await prisma.$queryRaw`SELECT 1`
		return NextResponse.json({ status: "ok" })
	} catch {
		return NextResponse.json({ status: "error" }, { status: 503 })
	}
}
