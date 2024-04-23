import { Movement, MovementType } from "@prisma/client";
import axios from "axios";

type CreateMovementParams = {
  type: MovementType,
  inventoryItemId: string,
  userId: string,
  companyId: string,
  currentInventory: number,
  destinationChamberId: string,
}

export const createMovement = (params: CreateMovementParams) =>
  axios.post<Movement>('/api/inventory/movement', params);
