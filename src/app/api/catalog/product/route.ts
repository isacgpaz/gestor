import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get('companyId') ?? ''
  const categoriesIds = request.nextUrl.searchParams.get('categories') ?? undefined
  const search = request.nextUrl.searchParams.get('search') ?? ''
  const page = Number(request.nextUrl.searchParams.get('page') ?? 1)
  const rowsPerPage = Number(request.nextUrl.searchParams.get('rowsPerPage') ?? 10)

  const company = await prisma.company.findUnique({
    where: { id: companyId },
  })

  if (!company) {
    return NextResponse.json(
      { message: 'Empresa não encontrada.' },
      { status: 404 }
    )
  }

  const categories = categoriesIds ? categoriesIds.split(',') : []

  const [products, totalProducts] = await prisma.$transaction([
    prisma.product.findMany({
      where: {
        companyId,
        categoryId: categories.length ? {
          in: categories
        } : undefined,
        name: {
          contains: search,
          mode: "insensitive"
        }
      },
      include: {
        category: true
      }
    }),
    prisma.product.count({
      where: {
        companyId,
        categoryId: categories.length ? {
          in: categories
        } : undefined,
        name: {
          contains: search,
          mode: "insensitive"
        }
      }
    })
  ])

  // const productsWithVariant = products.filter(
  //   (product) => !!product.variant
  // ) ?? []

  // const productsWithVariantIds = productsWithVariant.map(
  //   (product) => product.variant!.catalogVariantId
  // )

  const totalPages = Math.ceil(totalProducts / rowsPerPage)
  const hasNextPage = page !== totalPages && totalPages !== 0
  const hasPreviousPage = page !== 1

  // const catalogVariants = await prisma.catalogVariant.findMany({
  //   where: {
  //     companyId,
  //     id: {
  //       in: productsWithVariantIds
  //     }
  //   },
  //   include: {
  //     properties: true
  //   }
  // })

  // const productsWithVariantPropertiesLabels = products.map(
  //   (product) => {
  //     if (product.variant) {
  //       return {
  //         ...product,
  //         variant: {
  //           ...product.variant,
  //           properties: [
  //             ...product.variant.properties.map(
  //               (property) => {
  //                 const currentVariant = catalogVariants.find(
  //                   (variant) => variant.id === product.variant?.catalogVariantId
  //                 )

  //                 const label = currentVariant?.properties.find(
  //                   (currentProperty) => currentProperty.id === property.catalogVariantPropertyId
  //                 )?.name

  //                 return {
  //                   ...property,
  //                   label
  //                 }
  //               }
  //             ),
  //             ]
  //         }
  //       }
  //     }

  //     return product
  //   }
  // )

  return NextResponse.json({
    result: products,
    meta: {
      total: totalProducts,
      page,
      rowsPerPage,
      hasNextPage,
      hasPreviousPage
    }
  }, { status: 200 })
}

export async function POST(request: NextRequest) {
  const {
    companyId,
    categoryId,
    name,
    description,
    cost,
    variant
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

  const category = await prisma.catalogCategory.findUnique({
    where: { id: categoryId },
  })

  if (!category) {
    return NextResponse.json(
      { message: 'Categoria não encontrada.' },
      { status: 404 }
    )
  }

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

  const productCreated = await prisma.product.create({
    data: {
      companyId,
      categoryId,
      name,
      description,
      cost,
      variant
    }
  })

  return NextResponse.json(productCreated, { status: 201 })
}