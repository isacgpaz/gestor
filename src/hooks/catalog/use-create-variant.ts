import { createVariant } from "@/services/catalog/create-variant";
import { useMutation } from "@tanstack/react-query";

export function useCreateVariant() {
  return useMutation({
    mutationFn: createVariant
  });
}