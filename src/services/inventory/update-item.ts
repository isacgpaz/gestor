import { InventoryItem } from "@prisma/client";
import axios from "axios";

export const updateItem = ({ id, ...params }: Partial<InventoryItem>) =>
  axios.put<InventoryItem>(`/api/inventory/item/${id}`, params);
