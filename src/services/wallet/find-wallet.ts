import { Wallet } from "@/types/wallet"
import axios from "axios"

type FindWalletParams = {
  companyId?: string,
  customerId?: string
}

export async function findWallet(params: FindWalletParams) {
  const response = await axios<Wallet>('/api/wallet/by-user-and-company', { params })

  return response.data
}