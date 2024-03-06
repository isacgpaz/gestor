import { CatalogCategory, CatalogVariant, CatalogVariantProperty, Product } from "@prisma/client";

export type CreateProduct = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

export type CatalogVariantWithProperties = CatalogVariant & {
  properties: CatalogVariantProperty[]
}

export type CatalogVariantWithPropertiesUpdate = CatalogVariant & {
  properties: CatalogVariantPropertyUpdate[]
}

export type CatalogVariantPropertyUpdate = {
  id?: string,
  name: string
}

type ProductVariantPropertyWithName = {
  catalogVariantPropertyId: string,
  value: number,
  catalogVariantPropertyName: string
}

export type ProductWithVariant = Omit<Product, 'variant'> & {
  variant: {
    catalogVariantName: string,
    catalogVariantId: string,
    properties: ProductVariantPropertyWithName[]
  }
}

export type Catalog = {
  category: Pick<CatalogCategory, 'id' | 'name' | 'order'>,
  items: ProductWithVariant[]
}

export enum ShoppingBagItemTypeEnum {
  UNIT = 'UNIT',
  COMPOSED = 'COMPOSED',
}

type ShoppingBagItem = {
  id: string,
  quantity: number,
  cost: number,
  variantId?: string,
}

export type UnitShoppingBagItem = ShoppingBagItem & {
  product: ProductWithVariant,
  type: ShoppingBagItemTypeEnum.UNIT
}

export type ComposedShoppingBagItem = ShoppingBagItem & {
  firstProduct?: ProductWithVariant,
  secondProduct?: ProductWithVariant,
  type: ShoppingBagItemTypeEnum.COMPOSED
}

export type CatalogShoppingBag = Array<UnitShoppingBagItem | ComposedShoppingBagItem>