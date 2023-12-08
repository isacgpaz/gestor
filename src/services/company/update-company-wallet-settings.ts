type UpdateWalletSettingsProps = {
  companyId: string,
  size: number,
}

export async function updateWalletSettings(
  { companyId, size }: UpdateWalletSettingsProps
) {
  const response = await fetch(`/api/company/${companyId}/wallet-settings`, {
    method: 'PATCH',
    body: JSON.stringify({ size }),
  })

  return response
}