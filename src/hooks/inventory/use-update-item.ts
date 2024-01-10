import { updateItem } from "@/services/inventory/update-item";
import { useMutation } from "@tanstack/react-query";

export function useUpdateItem() {
  return useMutation({
    mutationFn: updateItem
  });
}