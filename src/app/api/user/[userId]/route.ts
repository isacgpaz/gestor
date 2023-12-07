import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

type Params = {
  params: {
    userId: string
  }
}

export async function GET(
  request: Request,
  { params }: Params
) {
  const userId = params.userId

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { company: true }
  })

  if (user) {
    return NextResponse.json(user, { status: 200 })
  }

  return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 })
}