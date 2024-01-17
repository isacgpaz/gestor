import { createProduct } from "@/services/catalog/create-product";
import { useMutation } from "@tanstack/react-query";

export function useCreateProduct() {
  return useMutation({
    mutationFn: createProduct
  });
}