import { CatalogCategory, Product } from "@prisma/client"
import axios from "axios"

type ProductsProps = {
  companyId?: string,
  categories?: string,
  search?: string,
  page: number,
}

type ProductsResponseProps = {
  result: Array<Product & { category: CatalogCategory }>,
  meta: {
    total: number,
    page: number,
    rowsPerPage: number,
    hasNextPage: boolean,
    hasPreviousPage: boolean
  }
}

export async function findProducts(params: ProductsProps) {
  const response = await axios<ProductsResponseProps>('/api/catalog/product', { params })

  return response.data
}