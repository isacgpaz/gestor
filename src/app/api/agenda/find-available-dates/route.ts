import { dayjs } from "@/lib/dayjs";
import { prisma } from "@/lib/prisma";
import { AvailableTimesType } from "@/types/schedule";
import { Agenda, BusinessHours, Company, Schedule } from "@prisma/client";
import { Dayjs } from "dayjs";
import { NextRequest, NextResponse } from "next/server";

type GetAvailableDaysParams = {
  startDateUTC: string,
  agenda: Agenda,
  company: Company,
  type: AvailableTimesType
}

type CheckDatesAvailableParams = {
  availableDays: Dayjs[],
  agenda: Agenda,
  schedules: Schedule[],
  company: Company
}

type CheckDatesAvailablesBySchedules = {
  availableDays: Dayjs[],
  agenda: Agenda,
  endDate: Dayjs,
  startDate: Dayjs,
  company: Company
}

type CheckIfIsDayAvailableParams = {
  time: Dayjs,
  agenda: Agenda
}

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get('companyId')
  const startDate = request.nextUrl.searchParams.get('startDate')
  const type = request.nextUrl.searchParams.get('type') as AvailableTimesType

  if (!companyId || !startDate || !type) {
    return NextResponse.json({}, { status: 400 })
  }

  const company = await prisma.company.findUnique({
    where: {
      id: companyId,
    }
  })

  if (!company) {
    return NextResponse.json(
      { message: 'Empresa não encontrada.' },
      { status: 400 }
    )
  }

  const agenda = await prisma.agenda.findUnique({
    where: {
      companyId
    }
  })

  if (!agenda) {
    return NextResponse.json(
      { message: 'Essa empresa não possui uma agenda ativada.' },
      { status: 400 }
    )
  }

  const availableDays = await getAvailableDays({
    agenda,
    startDateUTC: startDate,
    company,
    type
  })

  if (type === AvailableTimesType.DAY) {
    return NextResponse.json({ availableDays }, { status: 200 })
  } else {
    const uniqueDates = [...new Set(availableDays.map((availableDay) => dayjs(availableDay).format('DD/MM/YYYY')))]

    return NextResponse.json({ uniqueDates })
  }
}

export async function getAvailableDays({
  agenda,
  startDateUTC,
  company,
  type
}: GetAvailableDaysParams) {
  const { businessHours, range } = agenda

  const availableDays = []

  const startDate = dayjs(startDateUTC)
  let endDate = startDate.clone();

  switch (type) {
    case AvailableTimesType.DAY:
      endDate = endDate.endOf('day')
      break
    case AvailableTimesType.MONTH:
      endDate = endDate.endOf('month')
      break
    default: return []
  }

  let dayToSearch = startDate.clone().tz("America/Sao_Paulo").startOf('day')

  while (dayToSearch.isBefore(endDate)) {
    const dayOfWeek = dayToSearch.clone().format('dddd').toLowerCase() as keyof BusinessHours

    if (businessHours[dayOfWeek]) {
      const timeDates = []

      for (let businessHour of businessHours[dayOfWeek]) {
        const startTime = businessHour.startTime.split(':')
        const endTime = businessHour.endTime.split(':')

        let currentDate = dayToSearch.clone()
          .set('hours', Number(startTime[0]))
          .set('minutes', Number(startTime[1]))
          .set('seconds', 0)
          .set('milliseconds', 0)

        const maxDate = dayToSearch.clone()
          .set('hours', Number(endTime[0]))
          .set('minutes', Number(endTime[1]))
          .set('seconds', 0)
          .set('milliseconds', 0)

        while (
          currentDate.isBefore(maxDate)
          && currentDate.clone()
            .add(range!, 'minutes')
            .isSameOrBefore(maxDate)
        ) {
          timeDates.push(currentDate)
          currentDate = dayjs(currentDate).add(range!, 'minutes')
        }
      }

      for (const time of timeDates) {
        if (
          time.isSameOrAfter(startDate)
          && time.isSameOrBefore(endDate)
          && time.diff(dayjs().utc(), 'days') <= 60
          && time.isAfter(dayjs().utc())
          && checkIfIsDayAvailable({ time, agenda })
        ) {
          availableDays.push(time)
        }
      }
    }

    dayToSearch = dayToSearch.add(1, 'day');
  }

  const dateRangeAgenda = await checkDatesAvailablesBySchedules({
    agenda,
    availableDays,
    endDate,
    startDate,
    company
  })

  return checkDatesAvailablesBySchedules({
    agenda,
    company,
    endDate,
    startDate,
    availableDays: dateRangeAgenda
  })
}

function checkIfIsDayAvailable({
  time,
  agenda
}: CheckIfIsDayAvailableParams) {
  let isDayAvailable = true;

  if (agenda.unavailableDays) {
    isDayAvailable = !agenda.unavailableDays.some(
      (unavailableDay) => time.isBetween(
        unavailableDay.startDate,
        unavailableDay.endDate
      ))
  }

  return isDayAvailable
}

async function checkDatesAvailablesBySchedules({
  availableDays,
  agenda,
  startDate,
  endDate,
  company
}: CheckDatesAvailablesBySchedules) {
  const schedules = await prisma.schedule.findMany({
    where: {
      agendaId: agenda.id,
      // TODO: startDate?
    }
  })

  return checkDatesAvailable({ agenda, availableDays, schedules, company })
}

async function checkDatesAvailable({
  agenda,
  availableDays,
  schedules,
  company
}: CheckDatesAvailableParams) {
  const bufferStart = agenda.buffer?.before
  const bufferEnd = agenda.buffer?.after
  const range = agenda.range!

  return availableDays.filter((availableDay, index) => {
    let isDayAvailable = true

    const endDateAvailable = dayjs.utc(availableDay).add(range, 'minutes')

    if (dayjs.utc(availableDay).isBefore(dayjs().utc())) {
      isDayAvailable = false
    }

    for (var schedule of schedules) {
      let datePeopleTotal = 0

      schedules.forEach((schedule) => {
        const scheduleDatePeopleTotal = schedule.adultsAmmount + schedule.kidsAmmount

        if (dayjs.utc(schedule.startDate).isSame(availableDay)) {
          datePeopleTotal += scheduleDatePeopleTotal
        }
      })

      const maxCapacityPerDayExceeded = Number(company.scheduleSettings?.maxCapacity) <= datePeopleTotal

      if (dayjs.utc(schedule.startDate).isSame(availableDay) && maxCapacityPerDayExceeded) {
        isDayAvailable = false
      }

      if (dayjs.utc(availableDay).isBetween(schedule.startDate, schedule.endDate, 'minute', '()') && maxCapacityPerDayExceeded) {
        isDayAvailable = false
      }

      if (dayjs.utc(endDateAvailable).isBetween(schedule.startDate, schedule.endDate, 'minute', '()') && maxCapacityPerDayExceeded) {
        isDayAvailable = false
      }

      if (bufferStart) {
        const bufferTime = dayjs.utc(schedule.startDate).subtract(bufferStart, 'minutes')

        if (dayjs.utc(availableDay).isBetween(bufferTime, schedule.startDate, 'minute', '()')) {
          isDayAvailable = false
        }
      }

      if (bufferEnd) {
        const bufferTime = dayjs.utc(schedule.endDate).add(bufferEnd, 'minutes')

        if (dayjs.utc(availableDay).isBetween(bufferTime, schedule.endDate, 'minute', '()')) {
          isDayAvailable = false
        }
      }
    }

    return isDayAvailable
  })
}