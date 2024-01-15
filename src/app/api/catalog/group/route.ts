import { prisma } from "@/lib/prisma"
import { CatalogGroup } from "@prisma/client"
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
    },
    orderBy: {
      order: 'asc'
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

export async function PATCH(request: NextRequest) {
  const {
    groups,
    companyId
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
      id: {
        in: groups.map((item: CatalogGroup) => item.id)
      }
    },
  })

  if (catalogGroups.length !== groups.length) {
    return NextResponse.json(
      { message: 'Um ou mais grupos não foram encontrados.' },
      { status: 404 }
    )
  }

  for (const item of groups) {
    await prisma.catalogGroup.update({
      where: {
        id: item.id
      },
      data: {
        order: item.order
      }
    })
  }

  return NextResponse.json({ status: 204 })
}

