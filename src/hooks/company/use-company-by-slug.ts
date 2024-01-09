import { findCompanyBySlug } from "@/services/company/find-by-slug"
import { Company } from "@prisma/client"
import { UseQueryOptions, useQuery } from "@tanstack/react-query"

export function useCompanyBySlug(
  slug: string,
  config?: Omit<UseQueryOptions<Company, Error>, 'queryKey'>
) {
  const query = useQuery({
    queryKey: ['company-by-slug', slug],
    queryFn: () => findCompanyBySlug(slug),
    enabled: Boolean(slug),
    ...config
  })

  return query
}