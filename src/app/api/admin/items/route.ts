import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { getSessionFromRequest } from "@/lib/auth";
import { VEHICLE_SEGMENTS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { createItemSchema, getZodErrorMessage } from "@/lib/validation";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getSessionFromRequest(request);

  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "Bạn cần đăng nhập quản trị" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createItemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: getZodErrorMessage(parsed.error) },
      { status: 400 },
    );
  }

  try {
    const createdItem = await prisma.paintItem.create({
      data: {
        code: parsed.data.code,
        name: parsed.data.name,
        description: parsed.data.description,
        type: parsed.data.type,
        active: parsed.data.active,
        sortOrder: parsed.data.sortOrder,
        prices: {
          create: VEHICLE_SEGMENTS.map((segment) => ({
            segment,
            price: 0,
          })),
        },
      },
    });

    return NextResponse.json({ message: "Tạo hạng mục thành công", item: createdItem });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { message: "Mã hạng mục đã tồn tại, vui lòng dùng mã khác" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { message: "Không thể tạo hạng mục, vui lòng thử lại" },
      { status: 500 },
    );
  }
}
