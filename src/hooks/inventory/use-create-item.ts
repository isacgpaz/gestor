import { createItem } from "@/services/inventory/create-item";
import { useMutation } from "@tanstack/react-query";

export function useCreateItem() {
  return useMutation({
    mutationFn: createItem
  });
}