import { prisma } from "@/lib/prisma";
import { exclude } from "@/utils/exclude";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  email: z.string().email("Por favor, digite um e-mail válido."),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
})

export async function POST(req: Request) {
  try {
    const { name, email, password } = await signupSchema.parseAsync(await req.json())

    const userAlreadyExists = await prisma.user.findUnique({
      where: {
        email,
      }
    })

    if (userAlreadyExists) {
      return NextResponse.json({ message: 'User already exists.' }, { status: 400 })
    }

    const salt = bcrypt.genSaltSync(12);
    const passwordHashed = bcrypt.hashSync(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHashed,
        role: "CUSTOMER"
      }
    })

    const userWithoutPassword = exclude(user, ['password'])

    return NextResponse.json({ user: userWithoutPassword }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 })
  }
}