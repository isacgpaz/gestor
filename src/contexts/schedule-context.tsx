import { findCompanyBySlug } from "@/services/company/find-by-slug";
import { Schedule } from "@/types/schedule";
import { Company } from "@prisma/client";
import { useParams } from "next/navigation";
import { Dispatch, PropsWithChildren, SetStateAction, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type ScheduleContextProp = {
  schedule: Partial<Schedule> | undefined,
  setSchedule: Dispatch<SetStateAction<Partial<Schedule> | undefined>>,
  company: Company | undefined,
  setCompany: (company: Company | undefined) => void,
  isLoading: boolean,
  setIsLoading: (open: boolean) => void,
  step: number,
  setStep: (step: number) => void,
  goToNextStep: () => void,
  goToPreviousStep: () => void,
}

export const ScheduleContext = createContext<ScheduleContextProp>({} as ScheduleContextProp)

export function ScheduleProvider({ children }: PropsWithChildren) {
  const [schedule, setSchedule] = useState<Partial<Schedule> | undefined>(undefined);
  const [company, setCompany] = useState<Company | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState(0)

  const params = useParams()
  const { slug } = params

  const goToNextStep = useCallback(() => {
    setStep(step + 1)
  }, [step])

  const goToPreviousStep = useCallback(() => {
    if (step > 0) {
      setStep(step - 1)
    }
  }, [step])

  const getCompany = useCallback(async () => {
    if (slug) {
      setIsLoading(true)

      await findCompanyBySlug({ slug: slug as string }).then(async (response) => {
        if (response.ok) {
          const company = await response.json() as Company

          setCompany(company)
        }
      }).catch((e) => {
        console.error(e)
      }).finally(() => {
        setIsLoading(false)
      })
    }
  }, [slug])

  useEffect(() => {
    getCompany()
  }, [getCompany])

  const value: ScheduleContextProp = useMemo(() => ({
    schedule,
    setSchedule,
    company,
    setCompany,
    isLoading,
    setIsLoading,
    step,
    setStep,
    goToNextStep,
    goToPreviousStep
  }), [
    schedule,
    setSchedule,
    company,
    setCompany,
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

