import { findUniqueSchedule } from "@/services/schedule/find-unique"
import { Schedule } from "@prisma/client"
import { UseQueryOptions, useQuery } from "@tanstack/react-query"

export function useSchedule(
  scheduleId?: string,
  config?: Omit<UseQueryOptions<Schedule, Error>, 'queryKey'>
) {
  const query = useQuery({
    queryKey: ['available-to-schedule-by-date', scheduleId],
    queryFn: () => findUniqueSchedule(scheduleId),
    enabled: Boolean(scheduleId),
    ...config
  })

  return query
}