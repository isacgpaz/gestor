import { findAvailableDates } from "@/services/agenda/find-available-dates"
import { AvailableTimesType } from "@/types/schedule"
import { UseQueryOptions, useQuery } from "@tanstack/react-query"

type FindAvailableDatesParams = {
  startDate: string,
  type: AvailableTimesType,
  companyId?: string,
}

export function useAgendaAvailableDates(
  params: FindAvailableDatesParams,
  config?: Omit<UseQueryOptions<string[], Error>, 'queryKey'>
) {
  const query = useQuery<string[], Error>({
    queryKey: ['agenda-available-dates', params],
    queryFn: () => findAvailableDates(params),
    ...config,
  })

  return query
}