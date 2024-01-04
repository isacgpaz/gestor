import { dayjs } from "@/lib/dayjs";
import { prisma } from "@/lib/prisma";
import { AvailableTimesType } from "@/types/schedule";
import { Agenda, Company, UnavailableDays } from "@prisma/client";
import { Dayjs } from "dayjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get('companyId')
  const startDate = request.nextUrl.searchParams.get('startDate')
  const type = request.nextUrl.searchParams.get('type') as AvailableTimesType

  if (!startDate) {
    return NextResponse.json(
      { message: 'A data é obrigatória.' },
      { status: 400 }
    )
  }

  if (!companyId) {
    return NextResponse.json({ message: 'A empresa é obrigatória.' }, { status: 400 })
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

  const availableDates = await getAvailableDates(agenda, company, startDate, type)

  return NextResponse.json(availableDates, { status: 200 })
}

export async function getAvailableDates(
  agenda: Agenda,
  company: Company,
  startDate: string,
  type: AvailableTimesType
) {
  const { unavailableDays } = agenda

  const datesSpotSteps = getDatesSpotSteps(agenda, startDate, type)

  const availableDates = datesSpotSteps.filter((spotStep) => checkIfAvailable(
    dayjs(spotStep), unavailableDays
  ))

  const clearedSpotSteps = await removeFilledSpotSteps(agenda, company, availableDates)

  switch (type) {
    case AvailableTimesType.DAYS:
      return [...new Set(
        clearedSpotSteps.map((date) => dayjs(date).format('DD/MM/YYYY'))
      )]
    case AvailableTimesType.HOURS:
      return clearedSpotSteps;
    default: return []
  }
}

function getDatesSpotSteps(
  agenda: Agenda,
  startDateString: string,
  type: AvailableTimesType
) {
  const {
    availableHours,
    schedulingWindow,
    duration,
    minimumNotice
  } = agenda;

  const availableDays: Date[] = [];

  const startDate = dayjs(startDateString)
  let endDate = startDate.clone()

  switch (type) {
    case AvailableTimesType.DAYS:
      endDate = endDate.add(schedulingWindow ?? 60, 'days')
      break;
    case AvailableTimesType.HOURS:
      endDate = endDate.endOf('day')
      break;
    default:
      return [];
  }

  let dayToSearch = startDate.clone()

  while (dayToSearch.isBefore(endDate)) {
    const dayOfWeek = dayToSearch.format('dddd').toLowerCase() as keyof typeof availableHours

    if (availableHours[dayOfWeek].length) {
      const times = [];

      for (const availableHour of availableHours[dayOfWeek]) {
        if (availableHour.isActive) {
          const [minHour, minMinute] = availableHour.startTime.split(':')
          const [maxHour, maxMinute] = availableHour.endTime.split(':')

          let currentDate = dayToSearch.clone()
            .set('hour', Number(minHour))
            .set('minutes', Number(minMinute))
            .set('seconds', 0)
            .set('milliseconds', 0)

          const maxDate = currentDate.clone()
            .set('hour', Number(maxHour))
            .set('minutes', Number(maxMinute))
            .set('seconds', 0)
            .set('milliseconds', 0)

          while (
            currentDate.isBefore(maxDate) &&
            currentDate
              .clone()
              .add(duration ?? 60, 'minutes')
              .isSameOrBefore(maxDate)
          ) {
            times.push(currentDate);

            currentDate = currentDate.clone().add(Number(duration), 'minutes');
          }
        }
      }

      for (const time of times) {
        if (
          time.isSameOrAfter(startDate) &&
          time.isSameOrBefore(endDate) &&
          time.diff(dayjs(), 'hours') >= (minimumNotice ?? 0) &&
          time.diff(dayjs(), 'days') <= 60 &&
          time.isAfter(dayjs())
        ) {
          availableDays.push(time.toDate());
        }
      }
    }

    dayToSearch = dayToSearch.add(1, 'day')
  }

  return availableDays
}

function checkIfAvailable(time: Dayjs, unavailableDays: UnavailableDays[]) {
  let isAvailable = true;

  if (unavailableDays) {
    isAvailable = !unavailableDays.some((day) =>
      time.isBetween(dayjs(day.startDate), dayjs(day.endDate)),
    );
  }

  return isAvailable;
};

async function removeFilledSpotSteps(
  agenda: Agenda,
  company: Company,
  availableDates: Date[]
) {
  const {
    duration,
    buffer,
    spotStep,
    companyId
  } = agenda;

  const { scheduleSettings } = company

  const schedules = await prisma.schedule.findMany({
    where: { companyId }
  })

  return availableDates.filter((dateAvailable) => {
    let totalReserves = 0;

    const lastAvailableDate = dayjs(availableDates[availableDates.length - 1])
      .add(spotStep ?? 60, 'minutes');

    const serviceEndDate = dayjs(dateAvailable).add(duration ?? 60, 'minutes');

    if (dayjs(dateAvailable).isBefore(dayjs())) { return false; }

    if (dayjs(serviceEndDate).isAfter(lastAvailableDate)) { return false; }

    for (const schedule of schedules) {
      let isAvailable = true;

      if (dayjs(schedule.startDate).isSame(dateAvailable)) { isAvailable = false; }

      if (dayjs(dateAvailable).isBetween(schedule.startDate, schedule.endDate, 'minute', '()')) { isAvailable = false; }

      if (serviceEndDate.isBetween(schedule.startDate, schedule.endDate, 'minute', '()')) { isAvailable = false; }

      if (buffer?.before) {
        const bufferTime = dayjs(schedule.startDate).subtract(buffer.before, 'minutes');

        if (dayjs(dateAvailable).isBetween(bufferTime, schedule.startDate, 'minute', '()')) {
          isAvailable = false;
        }
      }

      if (buffer?.after) {
        const bufferTime = dayjs(schedule.endDate).add(buffer.after, 'minutes');

        if (dayjs(dateAvailable).isBetween(bufferTime, schedule.endDate, 'minute', '()')) {
          isAvailable = false;
        }
      }

      if (!isAvailable) {
        totalReserves = schedule.adultsAmmount + schedule.kidsAmmount
      }
    }

    if (scheduleSettings?.maxCapacity) {
      return totalReserves < scheduleSettings?.maxCapacity
    }

    return false
  });
}
