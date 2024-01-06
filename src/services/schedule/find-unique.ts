import axios from "axios"

export async function findUniqueSchedule(scheduleId?: string) {
  const response = await axios(`/api/schedule/${scheduleId}`)

  return response.data
}