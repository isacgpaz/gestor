import { prisma } from "@/lib/prisma"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
) {
  try {
    const { customerId, companyId, points } = await request.json()

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
        points,
        history: {
          set: {
            pointsAdded: points
          }
        }
      }
    })

    return NextResponse.json({ wallet }, { status: 201 })
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