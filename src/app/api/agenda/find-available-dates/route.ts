import { prisma } from "@/lib/prisma";
import { getAvailableDates } from "@/modules/agenda";
import { AvailableTimesType } from "@/types/schedule";
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