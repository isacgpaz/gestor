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

  const where = {
    companyId,
    startDate: {
      gte: dayjs.utc(startDate).startOf('day').toDate(),
      lte: dayjs.utc(startDate).endOf('day').toDate(),
    }
  }

  const [totalPending, totalReady, totalFinished] = await prisma.$transaction([
    prisma.schedule.count({
      where: {
        ...where,
        status: ScheduleStatus.PENDING,
      }
    }),
    prisma.schedule.count({
      where: {
        ...where,
        status: ScheduleStatus.READY,
      }
    }),
    prisma.schedule.count({
      where: {
        ...where,
        status: ScheduleStatus.FINISHED,
      }
    }),
  ])

  return NextResponse.json({
    totalPending, totalReady, totalFinished
  }, { status: 200 })
}
