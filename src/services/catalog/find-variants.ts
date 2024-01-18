import { CatalogVariantWithProperties } from "@/types/catalog"
import axios from "axios"

type CatalogVariantProps = {
  companyId?: string,
}

export async function findCatalogVariants(params: CatalogVariantProps) {
  const response = await axios<CatalogVariantWithProperties[]>('/api/catalog/variant', { params })

  return response.data
}