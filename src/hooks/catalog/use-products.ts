import { findProducts } from "@/services/catalog/find-products"
import { useInfiniteQuery } from "@tanstack/react-query"

type ProductsProps = {
  companyId?: string,
  categories?: string,
  search?: string,
}

export function useProducts(params: ProductsProps) {
  const query = useInfiniteQuery({
    queryKey: ['products', params],
    queryFn: ({ pageParam }) => findProducts({ ...params, page: pageParam + 1 }),
    getNextPageParam: (response) => response?.result?.length === 0 ||
      response?.result?.length >=
      response?.meta?.total
      ? undefined
      : response?.meta?.page,
    initialPageParam: 0,
  })

  return query
}