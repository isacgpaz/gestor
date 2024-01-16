import { updateCategory } from "@/services/catalog/update-category";
import { useMutation } from "@tanstack/react-query";

export function useUpdateCategory() {
  return useMutation({
    mutationFn: updateCategory
  });
}