import { findInventoryChambers } from "@/services/inventory/find-chambers"
import { useInfiniteQuery } from "@tanstack/react-query"

type InventoryChambersProps = {
  companyId?: string,
  search?: string
}

export function useInventoryChambers(params: InventoryChambersProps,) {
  const query = useInfiniteQuery({
    queryKey: ['inventory-chambers', { params }],
    queryFn: ({ pageParam }) => findInventoryChambers({ ...params, page: pageParam + 1 }),
    getNextPageParam: (response) => response?.result?.length === 0 ||
      response?.result?.length >=
      response?.meta?.total
      ? undefined
      : response?.meta?.page + 1,
    initialPageParam: 0
  })

  return query
}