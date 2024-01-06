
import { markScheduleAsFinished } from "@/services/schedule/mark-as-finished";
import { useMutation } from "@tanstack/react-query";

export function useMarkScheduleAsFinished() {
  return useMutation({
    mutationFn: markScheduleAsFinished
  });
}