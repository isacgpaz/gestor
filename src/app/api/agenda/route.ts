import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { duration, buffer, availableHours, companyId } = await request.json()

  const company = await prisma.company.findUnique({
    where: { id: companyId }
  })

  if (!company) {
    return NextResponse.json({ message: 'Empresa não encontrada.' }, { status: 404 })
  }

  const agenda = await prisma.agenda.create({
    data: {
      availableHours,
      buffer,
      companyId,
      duration
    }
  })

  return NextResponse.json(agenda, { status: 201 })
}