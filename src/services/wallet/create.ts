type CreateWalletProps = {
  customerId: string,
  companyId: string
}

export async function createWallet({ customerId, companyId }: CreateWalletProps) {
  const response = await fetch('/api/wallet', {
    method: 'POST',
    body: JSON.stringify({ customerId, companyId }),
  })

  return response
}