import { AvailableTimesType } from "@/types/schedule"
import axios from "axios"

type FindAvailableDatesParams = {
  startDate: string,
  type: AvailableTimesType,
  companyId?: string,
}

export async function findAvailableDates({
  startDate,
  type,
  companyId
}: FindAvailableDatesParams) {
  const response = await axios('/api/agenda/find-available-dates', {
    params: { startDate, type, companyId }
  })

  return response.data
}