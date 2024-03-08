import { Button } from "@/components/ui/button"
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useCreateInventoryMovementContext } from "@/contexts/create-inventory-movement-context"
import { Company, MovementType, User } from "@prisma/client"
import { Check, ChevronLeft, PackageMinus, PackagePlus } from "lucide-react"
import { useRouter } from "next/navigation"

export function TypeStep({ user }: {
  user?: User & { company: Company }
}) {
  const router = useRouter();

  const {
    movement,
    goToNextStep,
    updateMovement
  } = useCreateInventoryMovementContext()

  function updateMovementType(movementType: MovementType) {
    updateMovement({ type: movementType })
    goToNextStep()
  }

  return (
    <>
      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-base">
          Qual é a natureza da movimentação?
        </CardTitle>
      </CardHeader>

      <CardContent className="flex gap-3">
        <Button
          className="w-full"
          onClick={() => updateMovementType(MovementType.ENTRY)}
        >
          <PackagePlus className="h-4 w-4 mr-2" />
          Entrada

          {movement?.type === MovementType.ENTRY && (
            <Check className="h-4 w-4 ml-2" />
          )}
        </Button>

        {process.env.USERS_TO_HIDE_FUNCTIONS === user?.id && (
          <Button
            className="w-full"
            onClick={() => updateMovementType(MovementType.EGRESS)}
            variant='destructive'
          >
            <PackageMinus className="h-4 w-4 mr-2" />
            Saída

            {movement?.type === MovementType.EGRESS && (
              <Check className="h-4 w-4 ml-2" />
            )}
          </Button>
        )}
      </CardContent>

      <CardFooter className="pt-0 justify-between">
        <Button
          size='sm'
          variant='outline'
          onClick={() => router.back()}
          type='button'
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
      </CardFooter>
    </>
  )
}