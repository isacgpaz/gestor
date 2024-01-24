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

export type Catalog = {
  category: Pick<CatalogCategory, 'id' | 'name' | 'order'>,
  items: Product[]
}