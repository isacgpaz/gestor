type FindUsersParams = {
  search?: string
}

export async function findUsers({ search }: FindUsersParams) {
  const query = new URLSearchParams({
    search: search ?? ''
  }).toString()

  const response = await fetch('/api/user?' + query, {
    method: 'GET',
  })

  return response
}