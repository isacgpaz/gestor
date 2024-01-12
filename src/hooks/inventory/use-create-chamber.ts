import { createChamber } from "@/services/inventory/create-chamber";
import { useMutation } from "@tanstack/react-query";

export function useCreateChamber() {
  return useMutation({
    mutationFn: createChamber
  });
}