import { createSchedule } from "@/services/schedule/create";
import { useMutation } from "@tanstack/react-query";

export function useCreateSchedule() {
  return useMutation({
    mutationFn: createSchedule
  });
}