import { findWallet } from "@/services/wallet/find-wallet"
import { useQuery } from "@tanstack/react-query"

type WalletProps = {
  companyId?: string,
  customerId?: string
}

export function useWallet(params: WalletProps,) {
  const query = useQuery({
    queryKey: ['wallet', params],
    queryFn: () => findWallet(params),
    enabled: Boolean(params.companyId && params.customerId)
  })

  return query
}