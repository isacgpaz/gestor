import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
) {
  const customerId = request.nextUrl.searchParams.get('customerId')
  const companyId = request.nextUrl.searchParams.get('companyId')

  if (!customerId || !companyId) {
    return NextResponse.json({ status: 400 })
  }

  const userFounded = await prisma.user.findUnique({
    where: { id: customerId }
  })

  if (!userFounded) {
    return NextResponse.json({ message: 'Cliente não encontrado.' }, { status: 404 })
  }

  const companyFounded = await prisma.company.findUnique({
    where: { id: companyId }
  })

  if (!companyFounded) {
    return NextResponse.json({ message: 'Empresa não encontrada.' }, { status: 404 })
  }

  const wallet = await prisma.wallet.findUnique({
    where: {
      companyId_customerId: {
        companyId,
        customerId
      }
    },
    include: {
      company: true,
      customer: true
    }
  })

  if (!wallet) {
    return NextResponse.json({ message: 'Carteira não encontrada.' }, { status: 404 })
  }

  return NextResponse.json(wallet, { status: 200 })
}