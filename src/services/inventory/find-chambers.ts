import { Chamber } from "@prisma/client"
import axios from "axios"

type InventoryChambersProps = {
  companyId?: string,
  page?: number,
  search?: string
}

type InventoryChambersResponseProps = {
  result: Chamber[],
  meta: {
    total: number,
    page: number,
    rowsPerPage: number,
    hasNextPage: boolean,
    hasPreviousPage: boolean
  }
}

export async function findInventoryChambers(params: InventoryChambersProps) {
  const response = await axios<InventoryChambersResponseProps>('/api/inventory/chamber', { params })

  return response.data
}