import { deleteCategory } from "@/services/catalog/delete-category";
import { useMutation } from "@tanstack/react-query";

export function useDeleteCategory() {
  return useMutation({
    mutationFn: deleteCategory
  });
}