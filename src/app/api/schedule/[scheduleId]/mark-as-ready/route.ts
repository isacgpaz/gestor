import { prisma } from "@/lib/prisma";
import { ScheduleStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

type Params = {
  params: {
    scheduleId: string
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: Params
) {
  const { scheduleId } = params

  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    include: {
      company: true
    }
  })

  if (!schedule) {
    return NextResponse.json({ message: 'Agendamento não encontrado.' }, { status: 404 })
  }

  await prisma.schedule.update({
    where: { id: scheduleId },
    data: {
      status: ScheduleStatus.READY
    }
  })

  return NextResponse.json({ status: 204 })
}