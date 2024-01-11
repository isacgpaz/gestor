import { dayjs } from "@/lib/dayjs"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date') ?? ''
  const page = Number(request.nextUrl.searchParams.get('page') ?? 1)
  const rowsPerPage = Number(request.nextUrl.searchParams.get('rowsPerPage') ?? 10)
  const companyId = request.nextUrl.searchParams.get('companyId')

  if (!companyId) {
    return NextResponse.json({}, { status: 400 })
  }

  const [shoppingLists, totalShoppingLists] = await prisma.$transaction([
    prisma.shoppingList.findMany({
      skip: (page - 1) * rowsPerPage,
      take: rowsPerPage,
      where: {
        companyId,
        updatedAt: date ? {
          gte: dayjs.utc(date).startOf('day').toDate(),
          lte: dayjs.utc(date).endOf('day').toDate(),
        } : undefined,
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.shoppingList.count({
      where: {
        companyId,
        updatedAt: date ? {
          gte: dayjs.utc(date).startOf('day').toDate(),
          lte: dayjs.utc(date).endOf('day').toDate(),
        } : undefined,
      }
    })
  ])

  const totalPages = Math.ceil(totalShoppingLists / rowsPerPage)
  const hasNextPage = page !== totalPages && totalPages !== 0
  const hasPreviousPage = page !== 1

  return NextResponse.json({
    result: shoppingLists,
    meta: {
      total: totalShoppingLists,
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
    inventoryItemIds,
    newItems
  } = await request.json()

  const inventoryItems = await prisma.inventoryItem.findMany({
    where: {
      id: {
        in: inventoryItemIds
      }
    },
  })

  const everyItemsExists = inventoryItemIds.every(
    (inventoryItemId: string) => inventoryItems.some(
      (item) => item.id === inventoryItemId))

  if (!everyItemsExists) {
    return NextResponse.json(
      { message: 'Algum item da lista para reabastecimento não foi encontrado.' },
      { status: 404 }
    )
  }

  const company = await prisma.company.findUnique({
    where: {
      id: companyId
    },
  })

  if (!company) {
    return NextResponse.json(
      { message: 'Empresa não encontrada.' },
      { status: 404 }
    )
  }

  const shoppingList = await prisma.shoppingList.create({
    data: {
      companyId,
      items: {
        connect: inventoryItemIds.map((inventoryItemId: string) => ({
          id: inventoryItemId
        }))
      },
      newItems,
    }
  })

  return NextResponse.json({ shoppingList }, { status: 201 })
}