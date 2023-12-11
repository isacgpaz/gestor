import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { range, buffer, businessHours, companyId } = await request.json()

  const company = await prisma.company.findUnique({
    where: { id: companyId }
  })

  if (!company) {
    return NextResponse.json({ message: 'Empresa não encontrada.' }, { status: 404 })
  }

  const agenda = await prisma.agenda.create({
    data: {
      businessHours,
      buffer,
      companyId,
      range,
    }
  })

  return NextResponse.json(agenda, { status: 201 })
}