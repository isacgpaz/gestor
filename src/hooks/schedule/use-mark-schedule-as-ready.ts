
import { markScheduleAsReady } from "@/services/schedule/mark-as-ready";
import { useMutation } from "@tanstack/react-query";

export function useMarkScheduleAsReady() {
  return useMutation({
    mutationFn: markScheduleAsReady
  });
}