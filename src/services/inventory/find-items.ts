import { InventoryItemWithChamber } from "@/types/inventory"
import axios from "axios"

type InventoryItemsProps = {
  companyId?: string,
  page?: number,
  search?: string
}

type InventoryItemsResponseProps = {
  result: InventoryItemWithChamber[],
  meta: {
    total: number,
    page: number,
    rowsPerPage: number,
    hasNextPage: boolean,
    hasPreviousPage: boolean
  }
}

export async function findInventoryItems(params: InventoryItemsProps) {
  const response = await axios<InventoryItemsResponseProps>('/api/inventory/item', { params })

  return response.data
}