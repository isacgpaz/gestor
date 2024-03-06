import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const page = Number(request.nextUrl.searchParams.get('page') ?? 1)
  const rowsPerPage = Number(request.nextUrl.searchParams.get('rowsPerPage') ?? 10)
  const companyId = request.nextUrl.searchParams.get('companyId')
  const search = request.nextUrl.searchParams.get('search') ?? ''

  if (!companyId) {
    return NextResponse.json({}, { status: 400 })
  }

  const [chambers, totalChambers] = await prisma.$transaction([
    prisma.chamber.findMany({
      skip: (page - 1) * rowsPerPage,
      take: rowsPerPage,
      where: {
        companyId,
        name: {
          contains: search,
          mode: "insensitive"
        }
      }
    }),
    prisma.chamber.count({
      where: {
        companyId,
        name: {
          contains: search,
          mode: "insensitive"
        }
      }
    })
  ])

  const totalPages = Math.ceil(totalChambers / rowsPerPage)
  const hasNextPage = page !== totalPages && totalPages !== 0
  const hasPreviousPage = page !== 1

  return NextResponse.json({
    result: chambers,
    meta: {
      total: totalChambers,
      page,
      rowsPerPage,
      hasNextPage,
      hasPreviousPage
    }
  }, { status: 200 })
}

export async function POST(request: NextRequest) {
  const {
    companyId,
    name,
  } = await request.json()

  const company = await prisma.company.findUnique({
    where: { id: companyId },
  })

  if (!company) {
    return NextResponse.json(
      { message: 'Empresa não encontrada.' },
      { status: 404 }
    )
  }

  const chamberCreated = await prisma.chamber.create({
    data: {
      name,
      companyId
    }
  })

  return NextResponse.json(chamberCreated, { status: 201 })
}