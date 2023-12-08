import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get('search') ?? ''
  const page = Number(request.nextUrl.searchParams.get('page')) ?? 1
  const rowsPerPage = Number(request.nextUrl.searchParams.get('rowsPerPage')) ?? 10
  const companyId = request.nextUrl.searchParams.get('companyId')

  if (!companyId) {
    return NextResponse.json({ status: 400 })
  }

  const wallets = await prisma.wallet.findMany({
    skip: page * rowsPerPage,
    take: rowsPerPage,
    where: {
      companyId,
      customer: {
        name: {
          contains: search
        }
      }
    },
    include: {
      customer: true
    },
  })

  return NextResponse.json(wallets, { status: 200 })
}