export async function deleteCategory(
  categoryId: string
) {
  const response = await fetch(`/api/catalog/category/${categoryId}`, {
    method: 'DELETE',
  })

  return response
}