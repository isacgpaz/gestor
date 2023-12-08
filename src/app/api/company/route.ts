import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { name, slug, managerId, address, phone, slogan } = await req.json();

  const manager = await prisma.user.findUnique({ where: { id: managerId } })

  if (!manager) {
    return NextResponse.json({ message: 'Gerente não encontrado.' }, { status: 400 })
  }

  const company = await prisma.company.findUnique({ where: { slug } })

  if (company) {
    return NextResponse.json({ message: 'Slug indisponível.' }, { status: 400 })
  }

  const companyCreated = await prisma.company.create({
    data: {
      name,
      slug,
      managerId,
      address,
      phone,
      slogan
    }
  })

  return NextResponse.json(companyCreated, { status: 201 })
}