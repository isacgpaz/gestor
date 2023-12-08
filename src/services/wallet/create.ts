type CreateWalletProps = {
  customerId: string,
  companyId: string,
  points: number,
}

export async function createWallet({ customerId, companyId, points }: CreateWalletProps) {
  const response = await fetch('/api/wallet', {
    method: 'POST',
    body: JSON.stringify({ customerId, companyId, points }),
  })

  return response
}