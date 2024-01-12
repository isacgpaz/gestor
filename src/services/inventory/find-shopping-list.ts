import { InventoryItem } from "@prisma/client"
import axios from "axios"

type ShoppingListProps = {
  companyId?: string,
}

export async function findShoppingList(params: ShoppingListProps) {
  const response = await axios<InventoryItem[]>('/api/inventory/shopping-list', { params })

  return response.data
}