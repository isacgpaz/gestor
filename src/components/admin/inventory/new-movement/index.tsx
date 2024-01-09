'use client'

import { Card } from "@/components/ui/card"
import { movementType } from "@/contants/inventory"
import { CreateInventoryMovementProvider, useCreateInventoryMovementContext } from "@/contexts/create-inventory-movement-context"
import { cn } from "@/lib/utils"
import { Company, MovementType, User } from "@prisma/client"
import { InventoryItemStep } from "./inventory-item-step"
import { TypeStep } from "./type-step"

export function CreateInventoryMovementSteps({ user }: {
  user?: User & { company: Company }
}) {
  const { step, movement } = useCreateInventoryMovementContext()

  const movementSteps = [
    <TypeStep key='type' />,
    <InventoryItemStep key='inventory-item' user={user} />,
  ]

  return (
    <div>
      {movement?.type && (
        <span className="text-sm">
          Tipo de movimentação: {' '}
          <span className={cn(
            "font-medium",
            movement.type === MovementType.ENTRY && 'text-primary',
            movement.type === MovementType.EGRESS && 'text-destructive',
          )}>
            {movementType[movement?.type]}
          </span>
        </span>
      )}

      <Card className="mt-2 p-0 w-full max-w-sm mx-auto">
        {movementSteps[step]}
      </Card>
    </div>
  )
}

export function InventoryNewMovement({ user }: {
  user?: User & { company: Company }
}) {
  return (
    <CreateInventoryMovementProvider>
      <CreateInventoryMovementSteps user={user} />
    </CreateInventoryMovementProvider>
  )
}