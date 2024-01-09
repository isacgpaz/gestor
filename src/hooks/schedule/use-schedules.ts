import { findSchedules } from "@/services/schedule/find"
import { Schedule, ScheduleStatus } from "@prisma/client"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Dispatch, SetStateAction } from "react"

type SchedulesProps = {
  startDate: string,
  companyId?: string,
  status: ScheduleStatus,
  setCount: Dispatch<SetStateAction<number>>,
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

export function useSchedules({ setCount, ...params }: SchedulesProps,) {
  const query = useInfiniteQuery({
    queryKey: ['schedules', params],
    queryFn: ({ pageParam }) => {
      setCount((count) => count + 1)

      return findSchedules({ ...params, page: pageParam + 1 })
    },
    getNextPageParam: (response) => response?.result?.length === 0 ||
      response?.result?.length >=
      response?.meta?.total
      ? undefined
      : response?.meta?.page + 1,
    initialPageParam: 0,
    refetchInterval: 1000 * 60 * 5, // 5 minutes,
  })

  return query
}