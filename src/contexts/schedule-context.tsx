import { findCompanyBySlug } from "@/services/company/find-by-slug";
import { Schedule } from "@/types/schedule";
import { Company } from "@prisma/client";
import { useParams } from "next/navigation";
import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type ScheduleContextProp = {
  schedule: Schedule | undefined,
  setSchedule: (schedule: Schedule | undefined) => void,
  company: Company | undefined,
  setCompany: (company: Company | undefined) => void,
  isLoading: boolean,
  setIsLoading: (open: boolean) => void,
}

export const ScheduleContext = createContext<ScheduleContextProp>({} as ScheduleContextProp)

export function ScheduleProvider({ children }: PropsWithChildren) {
  const [schedule, setSchedule] = useState<Schedule | undefined>(undefined);
  const [company, setCompany] = useState<Company | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const params = useParams()
  const { slug } = params

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
  }), [
    schedule,
    setSchedule,
    company,
    setCompany,
    isLoading,
    setIsLoading,
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

