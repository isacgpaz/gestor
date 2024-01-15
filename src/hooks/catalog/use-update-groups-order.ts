import { updateGroupsOrder } from "@/services/catalog/update-groups-order";
import { useMutation } from "@tanstack/react-query";

export function useUpdateGroupsOrder() {
  return useMutation({
    mutationFn: updateGroupsOrder
  });
}