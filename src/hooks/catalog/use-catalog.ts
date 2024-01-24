import { findCatalog } from "@/services/catalog/find-catalog"
import { useQuery } from "@tanstack/react-query"

type CatalogProps = {
  companyId?: string,
}

export function useCatalog(params: CatalogProps) {
  const query = useQuery({
    queryKey: ['catalog', params],
    queryFn: () => findCatalog(params),
  })

  return query
}