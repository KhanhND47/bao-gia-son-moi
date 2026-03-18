import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getZodErrorMessage, updateItemSchema } from "@/lib/validation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function ensureAdmin(request: NextRequest): NextResponse | null {
  const session = getSessionFromRequest(request);

  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "Bạn cần đăng nhập quản trị" }, { status: 401 });
  }

  return null;
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const unauthorized = ensureAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = updateItemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: getZodErrorMessage(parsed.error) },
      { status: 400 },
    );
  }

  try {
    const updated = await prisma.paintItem.update({
      where: { id },
      data: {
        code: parsed.data.code,
        name: parsed.data.name,
        description: parsed.data.description,
        active: parsed.data.active,
        sortOrder: parsed.data.sortOrder,
      },
    });

    return NextResponse.json({ message: "Cập nhật hạng mục thành công", item: updated });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { message: "Mã hạng mục đã tồn tại, vui lòng dùng mã khác" },
        { status: 409 },
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Không tìm thấy hạng mục" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Không thể cập nhật hạng mục" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const unauthorized = ensureAdmin(request);

  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;

  try {
    await prisma.paintItem.delete({ where: { id } });
    return NextResponse.json({ message: "Đã xóa hạng mục" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Không tìm thấy hạng mục" }, { status: 404 });
    }

    return NextResponse.json({ message: "Không thể xóa hạng mục" }, { status: 500 });
  }
}
