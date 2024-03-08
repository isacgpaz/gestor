import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { name, slug, address, phone, slogan } = await req.json();

  const company = await prisma.company.findUnique({ where: { slug } })

  if (company) {
    return NextResponse.json({ message: 'Slug indisponível.' }, { status: 400 })
  }

  const companyCreated = await prisma.company.create({
    data: {
      name,
      slug,
      address,
      phone,
      slogan
    }
  })

  return NextResponse.json(companyCreated, { status: 201 })
}