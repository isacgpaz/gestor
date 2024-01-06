import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

type Params = {
  params: {
    scheduleId: string
  }
}

export async function GET(
  request: Request,
  { params }: Params
) {
  const { scheduleId } = params

  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId }
  })

  if (!schedule) {
    return NextResponse.json({ message: 'Reserva não encontrada.' }, { status: 404 })
  }

  return NextResponse.json(schedule, { status: 200 })
}