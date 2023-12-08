type FindCompanyBySlugProps = {
  slug: string,
}

export async function findCompanyBySlug(
  { slug }: FindCompanyBySlugProps
) {
  const response = await fetch(`/api/company/by-slug/${slug}`, {
    method: 'GET',
  })

  return response
}