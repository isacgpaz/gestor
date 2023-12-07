import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

type Params = {
  params: {
    walletId: string
  }
}

export async function PATCH(
  request: Request,
  { params }: Params
) {
  const { walletId } = params
  const { points } = await request.json()

  const walletFinded = await prisma.wallet.findUnique({
    where: { id: walletId }
  })

  if (!walletFinded) {
    return NextResponse.json({ message: 'Carteira não encontrada.' }, { status: 404 })
  }

  const wallet = await prisma.wallet.update({
    where: { id: walletId },
    data: {
      points: {
        increment: points
      },
      history: {
        push: {
          pointsAdded: points
        }
      }
    }
  })

  return NextResponse.json({ wallet }, { status: 200 })
}