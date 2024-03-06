import { updateProduct } from "@/services/catalog/update-product";
import { useMutation } from "@tanstack/react-query";

export function useUpdateProduct() {
  return useMutation({
    mutationFn: updateProduct
  });
}