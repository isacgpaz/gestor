import { dayjs } from "@/lib/dayjs"
import { prisma } from "@/lib/prisma"
import { MovementType } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date') ?? ''
  const type = request.nextUrl.searchParams.get('type')
  const page = Number(request.nextUrl.searchParams.get('page') ?? 1)
  const rowsPerPage = Number(request.nextUrl.searchParams.get('rowsPerPage') ?? 10)
  const companyId = request.nextUrl.searchParams.get('companyId')
  const search = request.nextUrl.searchParams.get('search') ?? ''

  if (!companyId) {
    return NextResponse.json({}, { status: 400 })
  }

  const [movements, totalMovements] = await prisma.$transaction([
    prisma.movement.findMany({
      skip: (page - 1) * rowsPerPage,
      take: rowsPerPage,
      where: {
        companyId,
        type: {
          in: type ? [type as MovementType] : undefined
        },
        createdAt: {
          gte: dayjs.utc(date).startOf('day').toDate(),
          lte: dayjs.utc(date).endOf('day').toDate(),
        },
        inventoryItem: {
          description: {
            contains: search,
            mode: "insensitive"
          }
        }
      },
      include: {
        user: true,
        inventoryItem: {
          include: {
            chamber: true
          }
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.movement.count({
      where: {
        companyId,
        type: {
          in: type ? [type as MovementType] : undefined
        },
        createdAt: {
          gte: dayjs.utc(date).startOf('day').toDate(),
          lte: dayjs.utc(date).endOf('day').toDate(),
        },
        inventoryItem: {
          description: {
            contains: search,
            mode: "insensitive"
          }
        }
      }
    })
  ])

  const totalPages = Math.ceil(totalMovements / rowsPerPage)
  const hasNextPage = page !== totalPages && totalPages !== 0
  const hasPreviousPage = page !== 1

  return NextResponse.json({
    result: movements,
    meta: {
      total: totalMovements,
      page,
      rowsPerPage,
      hasNextPage,
      hasPreviousPage
    }
  }, { status: 200 })
}

export async function POST(request: NextRequest) {
  const {
    type,
    inventoryItemId,
    quantity,
    userId,
    companyId
  } = await request.json()

  const inventoryItem = await prisma.inventoryItem.findUnique({
    where: {
      id: inventoryItemId
    },
  })

  if (!inventoryItem) {
    return NextResponse.json(
      { message: 'Item não encontrado.' },
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

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
  })

  if (!user) {
    return NextResponse.json(
      { message: 'Usuário não encontrado.' },
      { status: 404 }
    )
  }

  const movement = await prisma.movement.create({
    data: {
      type,
      inventoryItemId,
      quantity,
      userId,
      companyId
    }
  })

  await prisma.inventoryItem.update({
    where: {
      id: inventoryItemId
    },
    data: {
      quantity: {
        increment: quantity
      }
    }
  })

  return NextResponse.json({ movement }, { status: 201 })
}