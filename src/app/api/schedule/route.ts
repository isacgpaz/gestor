import { dayjs } from "@/lib/dayjs";
import { prisma } from "@/lib/prisma";
import { AvailableTimesType } from "@/types/schedule";
import { ScheduleStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getAvailableDays } from "../agenda/find-available-dates/route";

export async function GET(request: NextRequest) {
  const startDate = request.nextUrl.searchParams.get('startDate') ?? ''
  const status = request.nextUrl.searchParams.get('status') ?? ScheduleStatus.PENDING
  const page = Number(request.nextUrl.searchParams.get('page') ?? 1)
  const rowsPerPage = Number(request.nextUrl.searchParams.get('rowsPerPage') ?? 10)
  const companyId = request.nextUrl.searchParams.get('companyId')

  if (!companyId) {
    return NextResponse.json({}, { status: 400 })
  }

  const where = {
    companyId,
    status: status as ScheduleStatus,
    startDate: {
      gte: dayjs.utc(startDate).startOf('day').toDate(),
      lte: dayjs.utc(startDate).endOf('day').toDate(),
    }
  }

  const [schedules, totalSchedules] = await prisma.$transaction([
    prisma.schedule.findMany({
      skip: (page - 1) * rowsPerPage,
      take: rowsPerPage,
      where
    }),
    prisma.schedule.count({
      where
    })
  ])

  const totalPages = Math.ceil(totalSchedules / rowsPerPage)
  const hasNextPage = page !== totalPages && totalPages !== 0
  const hasPreviousPage = page !== 1

  return NextResponse.json({
    result: schedules,
    meta: {
      total: totalSchedules,
      page,
      rowsPerPage,
      hasNextPage,
      hasPreviousPage
    }
  }, { status: 200 })
}


export async function POST(request: NextRequest) {
  const {
    companyId,
    contact,
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
      contact,
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