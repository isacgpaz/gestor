import { dayjs } from "@/lib/dayjs";
import { prisma } from "@/lib/prisma";
import { AvailableTimesType } from "@/types/schedule";
import { NextRequest, NextResponse } from "next/server";
import { getAvailableDays } from "../agenda/find-available-dates/route";

export async function POST(request: NextRequest) {
  const {
    companyId,
    title,
    adultsAmmount,
    kidsAmmount,
    startDate,
    additionalInfo
  } = await request.json()

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { agenda: true }
  })

  if (!company) {
    return NextResponse.json(
      { message: 'Empresa não encontrada.' },
      { status: 404 }
    )
  }

  if (!company.agenda) {
    return NextResponse.json(
      { message: 'Agenda não encontrada.' },
      { status: 404 }
    )
  }

  const startDateDayjs = dayjs.utc(startDate)
  const endDate = startDateDayjs.clone().add(company.agenda.range ?? 60, 'minutes')

  const availableDates = await getAvailableDays({
    agenda: company.agenda,
    company,
    startDateUTC: startDateDayjs.toISOString(),
    type: AvailableTimesType.DAY
  })

  if (!availableDates.some((availableDate) => startDateDayjs.isSame(availableDate))) {
    return NextResponse.json({ message: 'Data indisponível.' }, { status: 400 })
  }

  const schedules = await prisma.schedule.findMany({
    where: {
      startDate
    }
  })

  let datePeopleTotal = 0

  schedules.forEach((schedule) => {
    const scheduleDatePeopleTotal = schedule.adultsAmmount + schedule.kidsAmmount

    if (dayjs.utc(schedule.startDate).isSame(startDateDayjs)) {
      datePeopleTotal += scheduleDatePeopleTotal
    }
  })

  const incomingDayCapacity = datePeopleTotal + adultsAmmount + kidsAmmount

  const maxCapacityPerDayExceeded = Number(company.scheduleSettings?.maxCapacity) < incomingDayCapacity

  if (maxCapacityPerDayExceeded) {
    return NextResponse.json({ message: 'Capacidade indisponível.' }, { status: 400 })
  }

  const scheduleCreated = await prisma.schedule.create({
    data: {
      startDate,
      title,
      additionalInfo,
      adultsAmmount,
      kidsAmmount,
      companyId,
      agendaId: company.agenda.id,
      endDate: endDate.toDate()
    }
  })

  return NextResponse.json(scheduleCreated, { status: 201 })
}