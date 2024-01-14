import axios from "axios";

type InventoryItemProps = {
  inventoryItemId: string,
  quantity: number,
}

type EntryInventoryParams = {
  userId?: string,
  companyId?: string,
  cart: InventoryItemProps[]
}

export const entryInventory = (params: EntryInventoryParams) =>
  axios.post('/api/inventory/movement/entry', params);
