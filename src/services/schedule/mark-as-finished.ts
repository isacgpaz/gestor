import axios from "axios";

export const markScheduleAsFinished = (scheduleId: string) =>
  axios.patch(`/api/schedule/${scheduleId}/mark-as-finished`);
