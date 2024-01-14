import { entryInventory } from "@/services/inventory/entry-inventory";
import { useMutation } from "@tanstack/react-query";

export function useEntryInventory() {
  return useMutation({
    mutationFn: entryInventory
  });
}