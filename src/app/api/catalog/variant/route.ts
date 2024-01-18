import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const {
    companyId,
    name,
    properties
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

  const catalogVariantCreated = await prisma.catalogVariant.create({
    data: {
      companyId,
      name,
      properties: properties.map((property: string) => ({
        name: property,
      }))
    }
  })

  return NextResponse.json(catalogVariantCreated, { status: 201 })
}