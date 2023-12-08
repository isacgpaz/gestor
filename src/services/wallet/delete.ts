export async function deleteWallet(
  walletId: string
) {
  const response = await fetch(`/api/wallet/${walletId}`, {
    method: 'DELETE',
  })

  return response
}