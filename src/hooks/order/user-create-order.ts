import { createOrder } from "@/services/order/create-order";
import { useMutation } from "@tanstack/react-query";

export function useCreateOrder() {
  return useMutation({
    mutationFn: createOrder
  });
}