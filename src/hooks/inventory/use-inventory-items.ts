import { findInventoryItems } from "@/services/inventory/find-items"
import { useInfiniteQuery } from "@tanstack/react-query"

type InventoryItemsProps = {
  companyId?: string,
  search?: string
}

export function useInventoryItems(params: InventoryItemsProps,) {
  const query = useInfiniteQuery({
    queryKey: ['inventory-items', { params }],
    queryFn: ({ pageParam }) => findInventoryItems({ ...params, page: pageParam + 1 }),
    getNextPageParam: (response) => response?.result?.length === 0 ||
      response?.result?.length >=
      response?.meta?.total
      ? undefined
      : response?.meta?.page,
    initialPageParam: 0
  })

  return query
}