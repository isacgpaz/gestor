import { findCatalogGroups } from "@/services/catalog/find-groups"
import { useQuery } from "@tanstack/react-query"

type CatalogGroupsProps = {
  companyId?: string,
}

export function useCatalogGroups(params: CatalogGroupsProps) {
  const query = useQuery({
    queryKey: ['catalog-groups', params],
    queryFn: () => findCatalogGroups(params),
  })

  return query
}