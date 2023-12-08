type FindCompanyProps = {
  companyId: string,
}

export async function findCompany(
  { companyId }: FindCompanyProps
) {
  const response = await fetch(`/api/company/${companyId}`, {
    method: 'GET',
  })

  return response
}