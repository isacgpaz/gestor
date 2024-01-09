import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const {
    companyId,
    name,
  } = await request.json()

  const company = await prisma.company.findUnique({
    where: { id: companyId },
  })

  if (!company) {
    return NextResponse.json(
      { message: 'Empresa não encontrada.' },
      { status: 404 }
    )
  }

  const chamberCreated = await prisma.chamber.create({
    data: {
      name,
      companyId
    }
  })

  return NextResponse.json(chamberCreated, { status: 201 })
}