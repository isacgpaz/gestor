type FindWalletByUserAndCompanyParams = {
  companyId: string,
  customerId: string
}

export async function findWalletByUserAndCompany(
  { companyId, customerId }: FindWalletByUserAndCompanyParams
) {
  const query = new URLSearchParams({
    companyId: companyId ?? '',
    customerId: customerId ?? '',
  }).toString()


  const response = await fetch('/api/wallet/by-user-and-company?' + query, {
    method: 'GET',
  })

  return response
}