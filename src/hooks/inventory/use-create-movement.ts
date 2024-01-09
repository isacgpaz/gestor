import { createMovement } from "@/services/inventory/create-movement";
import { useMutation } from "@tanstack/react-query";

export function useCreateMovement() {
  return useMutation({
    mutationFn: createMovement
  });
}