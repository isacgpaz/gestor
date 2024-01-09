import axios from "axios"

type SchedulesMetaProps = {
  startDate: string,
  companyId?: string,
}

type SchedulesMetaResponseProps = {
  totalPending: number,
  totalReady: number,
  totalFinished: number,
}

export async function findSchedulesMeta(params: SchedulesMetaProps) {
  const response = await axios<SchedulesMetaResponseProps>('/api/schedule/meta', { params })

  return response.data
}