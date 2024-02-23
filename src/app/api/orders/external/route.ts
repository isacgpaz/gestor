import { prisma } from "@/lib/prisma";
import { CreateOrderItem } from "@/types/order";
import { OrderItem, Product } from "@prisma/client";
import { NextResponse } from "next/server";

function productsExists(
  products: Product[],
  incomingProductsIds: string[]
): boolean {
  const productsIds = products.map((product) => product.id);

  const allIncomingProductsExists = incomingProductsIds.every(
    (incomingProductId) => productsIds.includes(incomingProductId)
  );

  return allIncomingProductsExists
}

function catalogVariantPropertiesExists(
  products: Product[],
  incomingCatalogVariantPropertiesIds: string[]
) {
  const productsWithVariants = products.filter((product) => product.variant)

  const productsCatalogVariantPropertiesIds = productsWithVariants.map(
    (product) => product.variant!.properties.map(
      (variantProperty) => variantProperty.catalogVariantPropertyId
    )
  ).flat()

  const uniqueProductsCatalogVariantPropertiesIds = [...new Set(productsCatalogVariantPropertiesIds)]

  const allIncomingCatalogVariantPropertiesExists = incomingCatalogVariantPropertiesIds.every(
    (productCatalogVariantPropertyId) => uniqueProductsCatalogVariantPropertiesIds.includes(
      productCatalogVariantPropertyId
    )
  )

  return allIncomingCatalogVariantPropertiesExists
}

export async function POST(req: Request) {
  const {
    items,
    type,
    companyId,
    customerId,
    deliveryAddress,
  } = await req.json();

  const company = await prisma.company.findUnique({ where: { id: companyId } })

  if (!company) {
    return NextResponse.json({ message: 'Empresa não encontrada.' }, { status: 404 })
  }

  const customer = await prisma.user.findUnique({ where: { id: customerId } })

  if (!customer) {
    return NextResponse.json({ message: 'Cliente não encontrado.' }, { status: 404 })
  }

  const itemsProductsIds: string[] = []
  const itemsCatalogVariantPropertiesIds: string[] = []

  items.forEach((item: OrderItem) => {
    if (item.uniformProductId) {
      itemsProductsIds.push(item.uniformProductId)
    }

    if (item.composedProductsIds) {
      item.composedProductsIds.forEach((composedProductId) => {
        itemsProductsIds.push(composedProductId)
      })
    }

    if (item.catalogVariantPropertyId) {
      itemsCatalogVariantPropertiesIds.push(
        item.catalogVariantPropertyId
      )
    }
  })

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: itemsProductsIds
      }
    },
  })

  if (!productsExists(products, itemsProductsIds)) {
    return NextResponse.json({ message: 'Produto não encontrado.' }, { status: 404 })
  }

  if (!catalogVariantPropertiesExists(products, itemsCatalogVariantPropertiesIds)) {
    return NextResponse.json(
      { message: 'Propriedade de variante não encontrada.' },
      { status: 404 }
    )
  }

  try {
    const orderItems: CreateOrderItem[] = items.map((item: CreateOrderItem) => {
      let price = 0

      if (item.uniformProductId) {
        const uniformProduct = products.find(
          (product) => product.id === item.uniformProductId
        )

        if (uniformProduct) {
          if (item.catalogVariantPropertyId) {
            const uniformProductCatalogVariantProperty = uniformProduct.variant?.properties.find(
              (variantProperty) => variantProperty.catalogVariantPropertyId === item.catalogVariantPropertyId
            )

            if (uniformProductCatalogVariantProperty) {
              price = uniformProductCatalogVariantProperty.value * item.quantity
            }
          } else {
            price = uniformProduct.cost! * item.quantity
          }
        }
      }

      if (item.composedProductsIds) {
        const composedProducts = products.filter(
          (product) => item.composedProductsIds.includes(product.id)
        )

        if (composedProducts.length) {
          if (item.catalogVariantPropertyId) {
            const composedProductsHasCatalogVariantProperty = composedProducts.every(
              (product) => product.variant?.properties.find(
                (variantProperty) => variantProperty.catalogVariantPropertyId === item.catalogVariantPropertyId
              )
            )

            if (composedProductsHasCatalogVariantProperty) {
              const composedProductsCatalogVariantProperties = composedProducts.map(
                (product) => product.variant?.properties.find(
                  (variantProperty) => variantProperty.catalogVariantPropertyId === item.catalogVariantPropertyId
                )!
              ).flat()

              if (composedProductsCatalogVariantProperties.length) {
                const composedProductsWithVariantValue = composedProductsCatalogVariantProperties.reduce(
                  (total, catalogVariantProperty) => {
                    return total + catalogVariantProperty?.value
                  }, 0
                );

                const composedProductsValue = (composedProductsWithVariantValue / composedProductsCatalogVariantProperties.length)

                price = composedProductsValue * item.quantity
              }
            } else {
              throw new Error(
                "Os produtos compostos possuem variantes diferentes.",
              )
            }
          } else {
            const composedProductsWithVariantValue = composedProducts.reduce(
              (total, product) => {
                return total + product?.cost!
              }, 0
            );

            const composedProductsValue = (composedProductsWithVariantValue / composedProducts.length)

            price = composedProductsValue * item.quantity
          }
        }
      }

      return {
        ...item,
        price
      }
    })

    const totalValue = orderItems.reduce(
      (total, orderItem) => {
        return total + orderItem.price
      }, 0
    )

    const orderCreated = await prisma.order.create({
      data: {
        type,
        companyId,
        customerId,
        deliveryAddress,
        totalValue,
        items: {
          createMany: {
            data: orderItems
          }
        }
      },
      include: {
        items: true
      }
    })

    return NextResponse.json(orderCreated, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      // TODO: return 500 status code here and validate errors
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    return error
  }
}