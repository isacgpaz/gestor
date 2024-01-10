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

  const [inventoryItems, totalInventoryItems] = await prisma.$transaction([
    prisma.inventoryItem.findMany({
      skip: (page - 1) * rowsPerPage,
      take: rowsPerPage,
      where: {
        companyId,
        description: {
          contains: search,
          mode: "insensitive"
        }
      },
      include: {
        chamber: true
      }
    }),
    prisma.inventoryItem.count({
      where: {
        companyId,
        description: {
          contains: search,
          mode: "insensitive"
        }
      }
    })
  ])

  const totalPages = Math.ceil(totalInventoryItems / rowsPerPage)
  const hasNextPage = page !== totalPages && totalPages !== 0
  const hasPreviousPage = page !== 1

  return NextResponse.json({
    result: inventoryItems,
    meta: {
      total: totalInventoryItems,
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
    chamberId,
    description,
    gtin,
    quantity,
    minQuantity,
    weight,
    cost,
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

  const chamber = await prisma.chamber.findUnique({
    where: { id: chamberId },
  })

  if (!chamber) {
    return NextResponse.json(
      { message: 'Câmara não encontrada.' },
      { status: 404 }
    )
  }

  const inventoryItemCreated = await prisma.inventoryItem.create({
    data: {
      cost,
      description,
      gtin,
      weight,
      quantity,
      minQuantity,
      chamberId,
      companyId,
    }
  })

  return NextResponse.json(inventoryItemCreated, { status: 201 })
}