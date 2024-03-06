import { prisma } from "@/lib/prisma"
import { CatalogCategory } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get('companyId')
  const search = request.nextUrl.searchParams.get('search') ?? ''

  if (!companyId) {
    return NextResponse.json({}, { status: 400 })
  }

  const catalogCategories = await prisma.catalogCategory.findMany({
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

  return NextResponse.json(catalogCategories, { status: 200 })
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

  const catalogCategories = await prisma.catalogCategory.findMany({
    where: {
      companyId
    }
  })

  let lastOrder = 0;

  for (const catalogCategory of catalogCategories) {
    if (catalogCategory.order > lastOrder) {
      lastOrder = catalogCategory.order;
    }
  }

  const catalogCategoryCreated = await prisma.catalogCategory.create({
    data: {
      companyId,
      name,
      order: lastOrder + 1
    }
  })

  return NextResponse.json(catalogCategoryCreated, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const {
    categories,
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

  const catalogCategories = await prisma.catalogCategory.findMany({
    where: {
      id: {
        in: categories.map((item: CatalogCategory) => item.id)
      }
    },
  })

  if (catalogCategories.length !== categories.length) {
    return NextResponse.json(
      { message: 'Ums ou mais categorias não foram encontradas.' },
      { status: 404 }
    )
  }

  for (const item of categories) {
    await prisma.catalogCategory.update({
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

