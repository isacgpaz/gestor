import { createGroup } from "@/services/catalog/create-group";
import { useMutation } from "@tanstack/react-query";

export function useCreateGroup() {
  return useMutation({
    mutationFn: createGroup
  });
}