import { dayjs } from "@/lib/dayjs";
import { prisma } from "@/lib/prisma";
import { MovementType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") ?? "";
  const type = request.nextUrl.searchParams.get("type");
  const page = Number(request.nextUrl.searchParams.get("page") ?? 1);
  const rowsPerPage = Number(
    request.nextUrl.searchParams.get("rowsPerPage") ?? 10
  );
  const companyId = request.nextUrl.searchParams.get("companyId");
  const search = request.nextUrl.searchParams.get("search") ?? "";

  if (!companyId) {
    return NextResponse.json({}, { status: 400 });
  }

  const [movements, totalMovements] = await prisma.$transaction([
    prisma.movement.findMany({
      skip: (page - 1) * rowsPerPage,
      take: rowsPerPage,
      where: {
        companyId,
        type: {
          in: type ? [type as MovementType] : undefined,
        },
        createdAt: date
          ? {
              gte: dayjs.utc(date).startOf("day").toDate(),
              lte: dayjs.utc(date).endOf("day").toDate(),
            }
          : undefined,
        inventoryItem: {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      include: {
        user: true,
        destinationChamber: true,
        originChamber: true,
        inventoryItem: {
          include: {
            chamber: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.movement.count({
      where: {
        companyId,
        type: {
          in: type ? [type as MovementType] : undefined,
        },
        createdAt: date
          ? {
              gte: dayjs.utc(date).startOf("day").toDate(),
              lte: dayjs.utc(date).endOf("day").toDate(),
            }
          : undefined,
        inventoryItem: {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalMovements / rowsPerPage);
  const hasNextPage = page !== totalPages && totalPages !== 0;
  const hasPreviousPage = page !== 1;

  return NextResponse.json(
    {
      result: movements,
      meta: {
        total: totalMovements,
        page,
        rowsPerPage,
        hasNextPage,
        hasPreviousPage,
      },
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  const {
    type,
    inventoryItemId,
    currentInventory,
    userId,
    companyId,
    destinationChamberId,
    reason,
  } = await request.json();

  if ([MovementType.EGRESS, MovementType.TRANSFER].includes(type) && !reason) {
    return NextResponse.json(
      {
        message:
          "Não é possível registrar uma saída do estoque sem informar o motivo.",
      },
      { status: 400 }
    );
  }

  const inventoryItem = await prisma.inventoryItem.findUnique({
    where: {
      id: inventoryItemId,
    },
  });

  if (!inventoryItem) {
    return NextResponse.json(
      { message: "Item não encontrado." },
      { status: 404 }
    );
  }

  const company = await prisma.company.findUnique({
    where: {
      id: companyId,
    },
  });

  if (!company) {
    return NextResponse.json(
      { message: "Empresa não encontrada." },
      { status: 404 }
    );
  }

  if (destinationChamberId) {
    const chamber = await prisma.chamber.findUnique({
      where: {
        id: destinationChamberId,
      },
    });

    if (!chamber) {
      return NextResponse.json(
        { message: "Câmara de destino não encontrada." },
        { status: 404 }
      );
    }
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Usuário não encontrado." },
      { status: 404 }
    );
  }

  const movement = await prisma.movement.create({
    data: {
      type,
      inventoryItemId,
      quantity: currentInventory,
      userId,
      companyId,
      destinationChamberId,
      originChamberId: inventoryItem.chamberId,
      reason,
    },
  });

  // TODO: change this type
  const data: any = {};

  if (type === MovementType.ENTRY) {
    data.currentInventory = {
      increment: currentInventory,
    };
  }

  if (type === MovementType.EGRESS) {
    data.currentInventory = {
      decrement: currentInventory,
    };
  }

  if (type === MovementType.TRANSFER) {
    data.chamberId = destinationChamberId;
  }

  await prisma.inventoryItem.update({
    where: {
      id: inventoryItemId,
    },
    data,
  });

  return NextResponse.json({ movement }, { status: 201 });
}
