import { findMovements } from "@/services/inventory/find-movements"
import { Movement, MovementType } from "@prisma/client"
import { useInfiniteQuery } from "@tanstack/react-query"

type MovementsProps = {
  date: string,
  companyId?: string,
  type?: MovementType
}

export type MovementsResponseProps = {
  result: Movement[],
  meta: {
    total: number,
    page: number,
    rowsPerPage: number,
    hasNextPage: boolean,
    hasPreviousPage: boolean
  }
}

export function useMovements(params: MovementsProps,) {
  const query = useInfiniteQuery({
    queryKey: ['movements', params],
    queryFn: ({ pageParam }) => findMovements({ ...params, page: pageParam + 1 }),
    getNextPageParam: (response) => response?.result?.length === 0 ||
      response?.result?.length >=
      response?.meta?.total
      ? undefined
      : response?.meta?.page + 1,
    initialPageParam: 0
  })

  return query
}