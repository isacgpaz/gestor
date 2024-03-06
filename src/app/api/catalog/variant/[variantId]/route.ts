import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

type Params = {
  params: {
    variantId: string
  }
}

type PropertyItem = {
  id: string,
  name: string
}

export async function PUT(
  request: NextRequest,
  { params }: Params
) {
  const { variantId } = params;

  const {
    companyId,
    name,
    properties
  } = await request.json()

  const variant = await prisma.catalogVariant.findUnique({
    where: {
      id: variantId
    },
    include: {
      properties: true
    }
  })

  if (!variant) {
    return NextResponse.json(
      { message: 'Variante não encontrada.' },
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

  const propertiesToAdd = properties.filter(
    (property: PropertyItem) => !property.id && property.name
  ) as PropertyItem[]

  const propertiesToUpdate = properties.filter(
    (property: PropertyItem) => property.id && property.name
  ) as PropertyItem[]

  const propertiesToDelete = variant.properties.filter(
    (property) => !properties.find(
      (propertyToUpdate: PropertyItem) => propertyToUpdate.id === property.id
    )
  )

  const catalogVariantUpdated = await prisma.catalogVariant.update({
    where: {
      id: variantId
    },
    data: {
      companyId,
      name,
      properties: {
        createMany: propertiesToAdd.length ? {
          data: propertiesToAdd,
        } : undefined,
        update: propertiesToUpdate.map((property) => ({
          where: {
            id: property.id
          },
          data: {
            name: property.name
          }
        })),
        deleteMany: {
          id: {
            in: propertiesToDelete.map((property) => property.id)
          }
        }
      }
    }
  })

  return NextResponse.json(catalogVariantUpdated, { status: 200 })
}
