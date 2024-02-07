import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

type Params = {
  params: {
    productId: string
  }
}

export async function PUT(
  request: NextRequest,
  { params }: Params
) {
  const { productId } = params;

  const {
    companyId,
    categoryId,
    name,
    description,
    cost,
    variant,
    allowComposition
  } = await request.json()

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    }
  })

  if (!product) {
    return NextResponse.json(
      { message: 'Produto não encontrado.' },
      { status: 404 }
    )
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
  })

  if (!company) {
    return NextResponse.json(
      { message: 'Empresa não encontrada.' },
      { status: 404 }
    )
  }

  const category = await prisma.catalogCategory.findUnique({
    where: { id: categoryId },
  })

  if (!category) {
    return NextResponse.json(
      { message: 'Categoria não encontrada.' },
      { status: 404 }
    )
  }

  if (variant) {
    const catalogVariant = await prisma.catalogVariant.findUnique({
      where: { id: variant.catalogVariantId },
    })

    if (!catalogVariant) {
      return NextResponse.json(
        { message: 'Variante não encontrada.' },
        { status: 404 }
      )
    }

    for (const property of variant.properties) {
      const catalogVariantProperty = await prisma.catalogVariantProperty.findUnique({
        where: { id: property.catalogVariantPropertyId },
      })

      if (!catalogVariantProperty) {
        return NextResponse.json(
          { message: 'Propriedade de variante não encontrada.' },
          { status: 404 }
        )
      }
    }
  }

  const productUpdated = await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      companyId,
      categoryId,
      name,
      description,
      cost,
      variant,
      allowComposition
    }
  })

  return NextResponse.json(productUpdated, { status: 201 })
}
