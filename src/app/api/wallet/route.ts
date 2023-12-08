import { prisma } from "@/lib/prisma"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get('search') ?? ''
  const page = Number(request.nextUrl.searchParams.get('page') ?? 1)
  const rowsPerPage = Number(request.nextUrl.searchParams.get('rowsPerPage') ?? 10)
  const companyId = request.nextUrl.searchParams.get('companyId')
  const customerId = request.nextUrl.searchParams.get('customerId')

  const [wallets, totalWallets] = await prisma.$transaction([
    prisma.wallet.findMany({
      skip: (page - 1) * rowsPerPage,
      take: rowsPerPage,
      where: {
        OR: [
          companyId ? {
            companyId,
            customer: {
              name: {
                contains: search,
                mode: 'insensitive',
              }
            }
          } : {},
          customerId ? {
            customerId,
            customer: {
              name: {
                contains: search,
                mode: 'insensitive',
              }
            }
          } : {}
        ]
      },
      include: {
        customer: true,
        company: true
      },
    }),
    prisma.wallet.count()
  ])

  const totalPages = Math.ceil(totalWallets / rowsPerPage)
  const hasNextPage = page !== totalPages && totalPages !== 0
  const hasPreviousPage = page !== 1

  return NextResponse.json({
    result: wallets,
    meta: {
      total: totalWallets,
      page,
      rowsPerPage,
      hasNextPage,
      hasPreviousPage
    }
  }, { status: 200 })
}

export async function POST(
  request: NextRequest,
) {
  try {
    const { customerId, companyId } = await request.json()

    const user = await prisma.user.findUnique({
      where: { id: customerId }
    })

    if (!user) {
      return NextResponse.json({ message: 'Cliente não encontrado.' }, { status: 404 })
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId }
    })

    if (!company) {
      return NextResponse.json({ message: 'Empresa não encontrada.' }, { status: 404 })
    }

    const wallet = await prisma.wallet.create({
      data: {
        companyId,
        customerId,
      },
      include: {
        company: true,
        customer: true
      }
    })

    return NextResponse.json(wallet, { status: 201 })
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({
          message: 'O cliente já possui uma carteira vinculada a esta empresa.'
        },
          { status: 400 })
      }
    }

    return NextResponse.json(error, { status: 500 })
  }
}