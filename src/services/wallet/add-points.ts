type AddPointsToWalletProps = {
  walletId: string,
  points: number,
}

export async function addPointsToWallet({ walletId, points }: AddPointsToWalletProps) {
  const response = await fetch(`/api/wallet/${walletId}/add-points`, {
    method: 'PATCH',
    body: JSON.stringify({ points }),
  })

  return response
}