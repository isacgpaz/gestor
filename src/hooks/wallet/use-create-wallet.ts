import { createWallet } from "@/services/wallet/create-wallet";
import { useMutation } from "@tanstack/react-query";

export function useCreateWallet() {
  return useMutation({
    mutationFn: createWallet
  });
}