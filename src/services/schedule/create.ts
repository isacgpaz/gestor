import { Schedule } from "@prisma/client";
import axios from "axios";

type CreateScheduleParams = Partial<Omit<Schedule, 'startDate'>> & {
  startDate: string,
  companyId?: string,
}

export const createSchedule = (params: CreateScheduleParams) =>
  axios.post<Schedule>('/api/schedule/', params);
