import { findSchedulesMeta } from "@/services/schedule/meta"
import { UseQueryOptions, useQuery } from "@tanstack/react-query"

type SchedulesMetaProps = {
  startDate: string,
  companyId?: string,
}

type SchedulesMetaResponseProps = {
  totalPending: number,
  totalReady: number,
  totalFinished: number,
}
export function useSchedulesMeta(
  params: SchedulesMetaProps,
  config?: Omit<UseQueryOptions<SchedulesMetaResponseProps, Error>, 'queryKey'>
) {
  const query = useQuery({
    queryKey: ['schedules-meta', params],
    queryFn: () => findSchedulesMeta(params),
    refetchInterval: 1000 * 60 * 5, // 5 minutes,
    ...config
  })

  return query
}