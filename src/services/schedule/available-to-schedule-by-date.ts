import axios from "axios"

type FindAvailableToScheduleByDateParams = {
  startDate: string,
  companyId?: string,
}

export async function findAvailableToScheduleByDate({
  startDate,
  companyId
}: FindAvailableToScheduleByDateParams) {
  const response = await axios('/api/schedule/available', {
    params: { startDate, companyId }
  })

  return response.data
}