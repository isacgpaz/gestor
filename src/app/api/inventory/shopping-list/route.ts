import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get('companyId')

  if (!companyId) {
    return NextResponse.json({}, { status: 400 })
  }

  const inventoryItems = await prisma.inventoryItem.findMany({
    where: {
      companyId,
    },
    include: {
      chamber: true
    }
  })

  const inventoryItemsBelowMinQuantity = inventoryItems.filter(
    (inventoryItem) => inventoryItem.quantity <= inventoryItem.minQuantity
  )

  return NextResponse.json(
    inventoryItemsBelowMinQuantity,
    { status: 200 }
  )
}