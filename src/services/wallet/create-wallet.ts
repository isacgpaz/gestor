import { Wallet } from "@/types/wallet"
import axios from "axios"

type CreateWalletProps = {
  customerId: string,
  companyId: string
}

export async function createWallet(params: CreateWalletProps) {
  const response = await axios.post<Wallet>('/api/wallet', params)

  return response
}