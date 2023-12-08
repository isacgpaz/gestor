import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

type Params = {
  params: {
    companyId: string
  }
}

export async function GET(
  request: Request,
  { params }: Params
) {
  const { companyId } = params

  const company = await prisma.company.findUnique({
    where: { id: companyId }
  })

  if (!company) {
    return NextResponse.json({ message: 'Empresa não encontrada.' }, { status: 404 })
  }

  return NextResponse.json(company, { status: 200 })
}