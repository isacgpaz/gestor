import { Schedule } from "@/types/schedule";
import { Agenda, Company } from "@prisma/client";
import { PropsWithChildren, createContext, useCallback, useContext, useMemo, useState } from "react";

type ScheduleContextProp = {
  schedule: Partial<Schedule> | undefined,
  company: Company & { agenda: Agenda } | undefined,
  isLoading: boolean,
  setIsLoading: (open: boolean) => void,
  step: number,
  setStep: (step: number) => void,
  goToNextStep: () => void,
  goToPreviousStep: () => void,
  updateSchedule: (incomingSchedule: Partial<Schedule>) => void
}

export const ScheduleContext = createContext<ScheduleContextProp>({} as ScheduleContextProp)

export function ScheduleProvider({ children, company }: PropsWithChildren & {
  company: Company & { agenda: Agenda }
}) {
  const [schedule, setSchedule] = useState<Partial<Schedule> | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState(0)

  const goToNextStep = useCallback(() => {
    setStep(step + 1)
  }, [step])

  const goToPreviousStep = useCallback(() => {
    if (step > 0) {
      setStep(step - 1)
    }
  }, [step])

  const updateSchedule = useCallback((incomingSchedule: Partial<Schedule>) => {
    setSchedule((schedule) => ({
      ...schedule,
      ...incomingSchedule,
    }))
  }, [])

  const value: ScheduleContextProp = useMemo(() => ({
    schedule,
    updateSchedule,
    company,
    isLoading,
    setIsLoading,
    step,
    setStep,
    goToNextStep,
    goToPreviousStep
  }), [
    schedule,
    updateSchedule,
    company,
    isLoading,
    setIsLoading,
    step,
    setStep,
    goToNextStep,
    goToPreviousStep
  ])

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  )
}

export const useSchedule = () => {
  const context = useContext(ScheduleContext);

  if (!context) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }

  return context;
};

