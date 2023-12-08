import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

type Params = {
  params: {
    companyId: string
  }
}

export async function PATCH(
  request: Request,
  { params }: Params
) {
  const { size } = await request.json()

  const { companyId } = params

  const companyFounded = await prisma.company.findUnique({
    where: { id: companyId }
  })

  if (!companyFounded) {
    return NextResponse.json({ message: 'Empresa não encontrada.' }, { status: 404 })
  }

  const company = await prisma.company.update({
    where: { id: companyId },
    data: {
      walletSettings: {
        size
      }
    }
  })

  return NextResponse.json(company, { status: 200 })
}