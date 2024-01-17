import { findCatalogCategories } from "@/services/catalog/find-categories"
import { useQuery } from "@tanstack/react-query"

type CatalogCategoriesProps = {
  companyId?: string,
}

export function useCatalogCategories(params: CatalogCategoriesProps) {
  const query = useQuery({
    queryKey: ['catalog-categories', params],
    queryFn: () => findCatalogCategories(params),
  })

  return query
}