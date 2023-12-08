type FindWallets = {
  page: number,
  companyId: string,
  search?: string
}

export async function findWallets(
  { companyId, page, search }: FindWallets
) {
  const query = new URLSearchParams({
    companyId: companyId ?? '',
    page: String(page ?? 1),
    search: search ?? '',
  }).toString()


  const response = await fetch('/api/wallet/?' + query, {
    method: 'GET',
  })

  return response
}