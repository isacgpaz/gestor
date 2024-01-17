import { createCategory } from "@/services/catalog/create-category";
import { useMutation } from "@tanstack/react-query";

export function useCreateCategory() {
  return useMutation({
    mutationFn: createCategory
  });
}