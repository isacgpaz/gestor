export type Schedule = {
  date: Date,
  time: Date,
  adultsAmmount: number,
  kidsAmmount?: number,
  contact: ScheduleContact,
  additionalInfo?: string
}

type ScheduleContact = {
  name: string,
  firstPhone: string,
  secondPhone: string,
}

export enum AvailableTimesType {
  DAYS = 'DAYS',
  HOURS = 'HOURS',
}