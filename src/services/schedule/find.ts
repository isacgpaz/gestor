import { Schedule, ScheduleStatus } from "@prisma/client"
import axios from "axios"

type SchedulesProps = {
  startDate: string,
  companyId?: string,
  page?: number,
  status: ScheduleStatus
}

type SchedulesResponseProps = {
  result: Schedule[],
  meta: {
    total: number,
    page: number,
    rowsPerPage: number,
    hasNextPage: boolean,
    hasPreviousPage: boolean
  }
}

export async function findSchedules(params: SchedulesProps) {
  const response = await axios<SchedulesResponseProps>('/api/schedule', { params })

  return response.data
}