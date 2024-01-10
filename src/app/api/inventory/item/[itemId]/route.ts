import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

type Params = {
  params: {
    itemId: string
  }
}

export async function PUT(
  request: NextRequest,
  { params }: Params
) {
  const { itemId } = params

  const {
    companyId,
    chamberId,
    description,
    gtin,
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

  const inventoryItemUpdated = await prisma.inventoryItem.update({
    where: { id: itemId },
    data: {
      cost,
      description,
      gtin,
      weight,
      minQuantity,
      chamberId,
      companyId,
    }
  })

  return NextResponse.json(inventoryItemUpdated, { status: 201 })
}