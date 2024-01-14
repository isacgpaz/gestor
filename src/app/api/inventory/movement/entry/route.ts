import { prisma } from "@/lib/prisma"
import { MovementType } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

type CartItem = {
  inventoryItemId: string,
  quantity: number
}

export async function POST(request: NextRequest) {
  const {
    cart,
    userId,
    companyId
  } = await request.json()

  const {

  } = cart

  const inventoryItems = await prisma.inventoryItem.findMany({
    where: {
      id: {
        in: cart.map((item: CartItem) => item.inventoryItemId)
      }
    },
  })

  if (inventoryItems.length !== cart.length) {
    return NextResponse.json(
      { message: 'Um ou mais itens não foram encontrados.' },
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

  await prisma.movement.createMany({
    data: cart.map((item: CartItem) => ({
      type: MovementType.ENTRY,
      inventoryItemId: item.inventoryItemId,
      quantity: item.quantity,
      userId,
      companyId
    }))
  })

  for (const item of cart) {
    const data = {
      quantity: {
        increment: item.quantity
      },
      cost: item.cost
    }

    await prisma.inventoryItem.update({
      where: {
        id: item.inventoryItemId
      },
      data
    })
  }

  return NextResponse.json(
    { message: 'Entrada de estoque realizada com sucesso.' },
    { status: 201 }
  )
}