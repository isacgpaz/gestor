export type Schedule = {
  date: Date,
  time: Date,
  adultsAmmount: number,
  kidsAmmount?: number,
  title: string,
  additionalInfo?: string
}

export enum AvailableTimesType {
  DAY = 'DAY',
  MONTH = 'MONTH',
  NEXTDAYS = 'NEXTDAYS',
}