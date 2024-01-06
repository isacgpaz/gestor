import axios from "axios";

export const markScheduleAsReady = (scheduleId: string) =>
  axios.patch(`/api/schedule/${scheduleId}/mark-as-ready`);
