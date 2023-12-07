type CreateWalletProps = {
  userId: string,
  companyId: string,
  points: number,
}

export async function createWallet({ userId, companyId, points }: CreateWalletProps) {
  const response = await fetch('/api/wallet', {
    method: 'POST',
    body: JSON.stringify({ userId, companyId, points }),
  })

  return response
}