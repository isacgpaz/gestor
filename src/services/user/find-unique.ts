export async function findUniqueUser(userId: string) {
  const response = await fetch(`/api/user/${userId}`, {
    method: 'GET',
  })

  return response
}