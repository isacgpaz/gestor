import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

type Params = {
  params: {
    categoryId: string
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: Params
) {
  const { categoryId } = params

  const categoryFinded = await prisma.catalogCategory.findUnique({
    where: { id: categoryId }
  })

  if (!categoryFinded) {
    return NextResponse.json({ message: 'Categoria não encontrada.' }, { status: 404 })
  }

  await prisma.catalogCategory.delete({
    where: { id: categoryId }
  })

  return NextResponse.json({ status: 204 })
}

export async function PUT(
  request: NextRequest,
  { params }: Params
) {
  const { categoryId } = params

  const { name } = await request.json()

  const category = await prisma.catalogCategory.findUnique({
    where: { id: categoryId },
  })

  if (!category) {
    return NextResponse.json(
      { message: 'Categoria não encontrada.' },
      { status: 404 }
    )
  }

  const categoryUpdated = await prisma.catalogCategory.update({
    where: { id: categoryId },
    data: {
      name
    }
  })

  return NextResponse.json(categoryUpdated, { status: 201 })
}
