import { CreateInventoryMovement } from "@/types/inventory";
import { PropsWithChildren, createContext, useCallback, useContext, useMemo, useState } from "react";

type CreateInventoryMovementContextProp = {
  movement: Partial<CreateInventoryMovement> | undefined,
  step: number,
  setStep: (step: number) => void,
  goToNextStep: () => void,
  goToPreviousStep: () => void,
  updateMovement: (incomingMovement: Partial<CreateInventoryMovement>) => void
}

export const CreateInventoryMovementContext = createContext<CreateInventoryMovementContextProp>({} as CreateInventoryMovementContextProp)

export function CreateInventoryMovementProvider({
  children,
}: PropsWithChildren) {
  const [movement, setMovement] = useState<Partial<CreateInventoryMovement> | undefined>(undefined);
  const [step, setStep] = useState(0)

  const goToNextStep = useCallback(() => {
    setStep(step + 1)
  }, [step])

  const goToPreviousStep = useCallback(() => {
    if (step > 0) {
      setStep(step - 1)
    }
  }, [step])

  const updateMovement = useCallback((incomingSchedule: Partial<CreateInventoryMovement>) => {
    setMovement((movement) => ({
      ...movement,
      ...incomingSchedule,
    }))
  }, [])

  const value: CreateInventoryMovementContextProp = useMemo(() => ({
    movement,
    updateMovement,
    step,
    setStep,
    goToNextStep,
    goToPreviousStep
  }), [
    movement,
    updateMovement,
    step,
    setStep,
    goToNextStep,
    goToPreviousStep
  ])

  return (
    <CreateInventoryMovementContext.Provider value={value}>
      {children}
    </CreateInventoryMovementContext.Provider>
  )
}

export const useCreateInventoryMovementContext = () => {
  const context = useContext(CreateInventoryMovementContext);

  if (!context) {
    throw new Error("useCreateInventoryMovementContext must be used within a CreateInventoryMovementProvider");
  }

  return context;
};

