import { CatalogCategory } from "@prisma/client"
import axios from "axios"

type CatalogCategoryProps = {
  companyId?: string,
}

export async function findCatalogCategories(params: CatalogCategoryProps) {
  const response = await axios<CatalogCategory[]>('/api/catalog/category', { params })

  return response.data
}