import { findCatalogVariants } from "@/services/catalog/find-variants"
import { useQuery } from "@tanstack/react-query"

type CatalogVariantsProps = {
  companyId?: string,
}

export function useCatalogVariants(params: CatalogVariantsProps) {
  const query = useQuery({
    queryKey: ['catalog-variants', params],
    queryFn: () => findCatalogVariants(params),
  })

  return query
}