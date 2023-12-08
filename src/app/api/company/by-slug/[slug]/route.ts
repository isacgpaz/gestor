import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

type Params = {
  params: {
    slug: string
  }
}

export async function GET(
  request: Request,
  { params }: Params
) {
  const { slug } = params

  const company = await prisma.company.findUnique({
    where: { slug }
  })

  if (!company) {
    return NextResponse.json({ message: 'Empresa não encontrada.' }, { status: 404 })
  }

  return NextResponse.json(company, { status: 200 })
}