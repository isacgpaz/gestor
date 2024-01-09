import { Chamber, InventoryItem, Movement, MovementType } from "@prisma/client";
import { User } from "./user";

export type InventoryItemWithChamber = InventoryItem & { chamber: Chamber }

export type CreateInventoryMovement = {
  type: MovementType;
  inventoryItem: InventoryItemWithChamber;
}

export type MovementWithItemAndUser = Movement & {
  inventoryItem: InventoryItemWithChamber;
  user: User
}