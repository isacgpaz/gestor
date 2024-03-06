import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get('companyId')
  const search = request.nextUrl.searchParams.get('search') ?? ''

  if (!companyId) {
    return NextResponse.json({}, { status: 400 })
  }

  const catalogVariants = await prisma.catalogVariant.findMany({
    where: {
      companyId,
      name: {
        contains: search,
        mode: "insensitive"
      }
    },
    include: {
      properties: true
    }
  })

  return NextResponse.json(catalogVariants, { status: 200 })
}

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
      properties: {
        create: properties.map((property: string) => ({
          name: property
        }))
      }
    }
  })

  return NextResponse.json(catalogVariantCreated, { status: 201 })
}