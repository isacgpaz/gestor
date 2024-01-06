import { findSchedules } from "@/services/schedule/find"
import { Schedule, ScheduleStatus } from "@prisma/client"
import { useInfiniteQuery } from "@tanstack/react-query"

type SchedulesProps = {
  startDate: string,
  companyId?: string,
  status: ScheduleStatus
}

export type SchedulesResponseProps = {
  result: Schedule[],
  meta: {
    total: number,
    page: number,
    rowsPerPage: number,
    hasNextPage: boolean,
    hasPreviousPage: boolean
  }
}

export function useSchedules(params: SchedulesProps,) {
  const query = useInfiniteQuery({
    queryKey: ['available-to-schedule-by-date', params],
    queryFn: ({ pageParam }) => findSchedules({ ...params, page: pageParam + 1 }),
    getNextPageParam: (response) => response?.result?.length === 0 ||
      response?.result?.length >=
      response?.meta?.total
      ? undefined
      : response?.meta?.page + 1,
    initialPageParam: 0
  })

  return query
}