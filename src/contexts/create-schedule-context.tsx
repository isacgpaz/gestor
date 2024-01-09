import { CreateSchedule, Schedule } from "@/types/schedule";
import { Agenda, Company } from "@prisma/client";
import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type CreateScheduleContextProp = {
  schedule: Partial<Schedule> | undefined,
  company: Company & { agenda: Agenda } | undefined,
  isLoading: boolean,
  setIsLoading: (open: boolean) => void,
  step: number,
  setStep: (step: number) => void,
  goToNextStep: () => void,
  goToPreviousStep: () => void,
  updateSchedule: (incomingSchedule: Partial<CreateSchedule>) => void
}

export const CreateScheduleContext = createContext<CreateScheduleContextProp>({} as CreateScheduleContextProp)

export function CreateScheduleProvider({
  children,
  company,
  schedule: defaultSchedule
}: PropsWithChildren & {
  company: Company & { agenda: Agenda },
  schedule?: Partial<Schedule>
}) {
  const [schedule, setSchedule] = useState<Partial<Schedule> | undefined>(defaultSchedule ?? undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState(defaultSchedule ? 3 : 0)

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

  useEffect(() => {
    if (defaultSchedule) {
      setSchedule(defaultSchedule)
      setStep(3)
    }
  }, [defaultSchedule])

  const value: CreateScheduleContextProp = useMemo(() => ({
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
    <CreateScheduleContext.Provider value={value}>
      {children}
    </CreateScheduleContext.Provider>
  )
}

export const useCreateScheduleContext = () => {
  const context = useContext(CreateScheduleContext);

  if (!context) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }

  return context;
};

