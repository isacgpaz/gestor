import { updateCategoriesOrder } from "@/services/catalog/update-categories-order";
import { useMutation } from "@tanstack/react-query";

export function useUpdateCategoriesOrder() {
  return useMutation({
    mutationFn: updateCategoriesOrder
  });
}