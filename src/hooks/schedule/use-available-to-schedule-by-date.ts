import { findAvailableToScheduleByDate } from "@/services/schedule/available-to-schedule-by-date"
import { UseQueryOptions, useQuery } from "@tanstack/react-query"

type AvailableToScheduleByDateProps = {
  startDate: string,
  companyId?: string
}

export function useAvailableToScheduleByDate(
  { startDate, companyId }: AvailableToScheduleByDateProps,
  config?: Omit<UseQueryOptions<string[], Error>, 'queryKey'>
) {
  const query = useQuery({
    queryKey: ['available-to-schedule-by-date', { startDate, companyId }],
    queryFn: () => findAvailableToScheduleByDate({ startDate, companyId }),
    enabled: Boolean(startDate) && Boolean(companyId),
    ...config
  })

  return query
}