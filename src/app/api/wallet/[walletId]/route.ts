import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

type Params = {
  params: {
    walletId: string
  }
}

export async function DELETE(
  request: Request,
  { params }: Params
) {
  const { walletId } = params

  const walletFinded = await prisma.wallet.findUnique({
    where: { id: walletId }
  })

  if (!walletFinded) {
    return NextResponse.json({ message: 'Carteira não encontrada.' }, { status: 404 })
  }

  await prisma.wallet.delete({
    where: { id: walletId }
  })

  return NextResponse.json({ status: 204 })
}