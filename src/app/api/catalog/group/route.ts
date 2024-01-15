import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get('companyId')
  const search = request.nextUrl.searchParams.get('search') ?? ''

  if (!companyId) {
    return NextResponse.json({}, { status: 400 })
  }

  const catalogGroups = await prisma.catalogGroup.findMany({
    where: {
      companyId,
      name: {
        contains: search,
        mode: "insensitive"
      }
    }
  })

  return NextResponse.json(catalogGroups, { status: 200 })
}

export async function POST(request: NextRequest) {
  const {
    companyId,
    name
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

  const catalogGroups = await prisma.catalogGroup.findMany({
    where: {
      companyId
    }
  })

  let lastOrder = 0;

  for (const catalogGroup of catalogGroups) {
    if (catalogGroup.order > lastOrder) {
      lastOrder = catalogGroup.order;
    }
  }

  const catalogGroupCreated = await prisma.catalogGroup.create({
    data: {
      companyId,
      name,
      order: lastOrder + 1
    }
  })

  return NextResponse.json(catalogGroupCreated, { status: 201 })
}