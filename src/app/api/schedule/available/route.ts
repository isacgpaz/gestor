import { dayjs } from "@/lib/dayjs"
import { prisma } from "@/lib/prisma"
import { ScheduleStatus } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const startDate = request.nextUrl.searchParams.get('startDate') ?? ''
  const companyId = request.nextUrl.searchParams.get('companyId')

  if (!companyId) {
    return NextResponse.json({}, { status: 400 })
  }

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

  const where = {
    companyId,
    status: ScheduleStatus.READY,
    startDate: {
      gte: dayjs.utc(startDate).startOf('day').toDate(),
      lte: dayjs.utc(startDate).endOf('day').toDate(),
    }
  }

  const schedules = await prisma.schedule.findMany({
    where,
  })

  const startDateDayjs = dayjs.utc(startDate)

  let datePeopleTotal = 0

  schedules.forEach((schedule) => {
    const scheduleDatePeopleTotal = schedule.adultsAmmount + schedule.kidsAmmount

    if (dayjs.utc(schedule.startDate).isSame(startDateDayjs)) {
      datePeopleTotal += scheduleDatePeopleTotal
    }
  })

  const availableAtMoment = Number(company?.scheduleSettings?.maxCapacity) - datePeopleTotal

  return NextResponse.json(availableAtMoment, { status: 200 })
}