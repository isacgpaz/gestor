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
    where: { id: walletId },
    include: {
      company: true
    }
  })

  if (!walletFinded) {
    return NextResponse.json({ message: 'Carteira não encontrada.' }, { status: 404 })
  }

  const walletSize = walletFinded.company.walletSettings?.size ?? 10
  const isCompleted = walletSize === walletFinded.points + points
  const reset = walletSize === walletFinded.points

  const wallet = await prisma.wallet.update({
    where: { id: walletId },
    data: {
      points: reset
        ? { set: points }
        : { increment: points },
      history: {
        push: {
          pointsAdded: points,
          isCompleted
        }
      }
    }
  })

  return NextResponse.json({ wallet }, { status: 200 })
}