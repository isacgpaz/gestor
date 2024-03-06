import { dayjs } from "@/lib/dayjs"
import { prisma } from "@/lib/prisma"
import { OrderStatus, OrderType } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get('companyId') ?? ''
  const startDate = request.nextUrl.searchParams.get('startDate') ?? ''
  const endDate = request.nextUrl.searchParams.get('endDate') ?? ''
  const type = request.nextUrl.searchParams.get('type') ?? undefined
  const status = request.nextUrl.searchParams.get('status') ?? undefined
  const page = Number(request.nextUrl.searchParams.get('page') ?? 1)
  const rowsPerPage = Number(request.nextUrl.searchParams.get('rowsPerPage') ?? 10)

  const company = await prisma.company.findUnique({
    where: { id: companyId },
  })

  if (!company) {
    return NextResponse.json(
      { message: 'Empresa não encontrada.' },
      { status: 404 }
    )
  }

  const where = {
    companyId,
    status: status as OrderStatus,
    type: type as OrderType,
    createdAt: {
      gte: startDate ? dayjs.utc(startDate).startOf('day').toDate() : undefined,
      lte: startDate && endDate ? dayjs.utc(endDate).endOf('day').toDate() : undefined,
    }
  }

  const [orders, totalOrders] = await prisma.$transaction([
    prisma.order.findMany({
      skip: (page - 1) * rowsPerPage,
      take: rowsPerPage,
      where,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        status: true,
        type: true,
        totalValue: true,
        table: true,
        deliveryAddress: {
          select: {
            street: true,
          }
        },
        createdAt: true,
      }
    }),
    prisma.order.count({
      where
    })
  ])

  const totalPages = Math.ceil(totalOrders / rowsPerPage)
  const hasNextPage = page !== totalPages && totalPages !== 0
  const hasPreviousPage = page !== 1

  return NextResponse.json({
    result: orders,
    meta: {
      total: totalOrders,
      page,
      rowsPerPage,
      hasNextPage,
      hasPreviousPage
    }
  }, { status: 200 })
}