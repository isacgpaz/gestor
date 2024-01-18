import { updateVariant } from "@/services/catalog/update-variant";
import { useMutation } from "@tanstack/react-query";

export function useUpdateVariant() {
  return useMutation({
    mutationFn: updateVariant
  });
}