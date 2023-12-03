import { prisma } from "@/lib/prisma";
import bcrypt from 'bcrypt';
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } })

  if (user) {
    return NextResponse.json({ message: 'E-mail indisponível.' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const userCreated = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    }
  })

  return NextResponse.json(userCreated, { status: 201 })
}