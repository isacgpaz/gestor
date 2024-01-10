import { CreateInventoryItem } from "@/types/inventory";
import { InventoryItem } from "@prisma/client";
import axios from "axios";

export const createItem = (params: Partial<CreateInventoryItem>) =>
  axios.post<InventoryItem>('/api/inventory/item', params);
