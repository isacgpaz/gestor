type FindWallets = {
  page: number,
  companyId?: string,
  customerId?: string,
  search?: string
}

export async function findWallets(
  { companyId, customerId, page, search }: FindWallets
) {
  const query = new URLSearchParams({
    companyId: companyId ?? '',
    customerId: customerId ?? '',
    page: String(page ?? 1),
    search: search ?? '',
  }).toString()

  const response = await fetch('/api/wallet/?' + query, {
    method: 'GET',
  })

  return response
}