export type Schedule = {
  date: Date,
  time: Date,
  adultsAmmount: number,
  kidsAmmount?: number,
  contact: ScheduleContact,
  additionalInfo?: string,
  id: string
}

export type CreateSchedule = Omit<Schedule, 'id'>

type ScheduleContact = {
  name: string,
  firstPhone: string,
  secondPhone: string,
}

export enum AvailableTimesType {
  DAYS = 'DAYS',
  HOURS = 'HOURS',
}