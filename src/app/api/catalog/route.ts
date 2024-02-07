import { prisma } from "@/lib/prisma";
import { Catalog, ProductWithVariant } from "@/types/catalog";
import { CatalogCategory, Product } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

function groupByCategory(
  products: Array<Product | ProductWithVariant>,
  categories: CatalogCategory[]
) {
  const catalog: Catalog[] = [];

  categories.forEach(category => {
    const productsByCatalog: Array<Product | ProductWithVariant> = products.filter(
      (product) => product.categoryId === category.id
    );

    if (productsByCatalog.length > 0) {
      catalog.push({
        category: {
          id: category.id,
          name: category.name,
          order: category.order
        },
        items: productsByCatalog as ProductWithVariant[],
      });
    }
  });

  return catalog;
}

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get('companyId') ?? ''
  const categoriesIds = request.nextUrl.searchParams.get('categories') ?? undefined
  const search = request.nextUrl.searchParams.get('search') ?? ''

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

  const products = await prisma.product.findMany({
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
    },
  })

  const catalogCategories = await prisma.catalogCategory.findMany({
    where: {
      companyId,
    }
  })

  const catalogVariants = await prisma.catalogVariant.findMany({
    where: {
      companyId,
    },
    include: {
      properties: true
    }
  })

  const productsWithVariants: Array<Product | ProductWithVariant> = products.map((product) => {
    if (product.variant) {
      const productVariant = catalogVariants.find(
        (catalogVariant) => catalogVariant.id === product.variant?.catalogVariantId
      )

      return {
        ...product,
        variant: {
          ...product.variant,
          catalogVariantName: productVariant?.name,
          properties: product.variant.properties.map((property) => ({
            ...property,
            catalogVariantPropertyName: productVariant?.properties.find(
              (variantProperty) => variantProperty.id === property.catalogVariantPropertyId
            )?.name,
          }))
        }
      }
    }

    return product
  })

  const catalog = groupByCategory(productsWithVariants, catalogCategories)
  const catalogOrdered = catalog.sort(
    (a, b) => a.category.order - b.category.order
  )

  return NextResponse.json(
    catalogOrdered,
    { status: 200 }
  )
}
