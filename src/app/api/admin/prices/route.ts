import { NextRequest, NextResponse } from "next/server";

import { getSessionFromRequest } from "@/lib/auth";
import { bulkUpdatePriceSchema, getZodErrorMessage } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const session = getSessionFromRequest(request);

  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "Bạn cần đăng nhập quản trị" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bulkUpdatePriceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: getZodErrorMessage(parsed.error) },
      { status: 400 },
    );
  }

  const uniqueItemIds = [...new Set(parsed.data.updates.map((update) => update.itemId))];

  const existingItemCount = await prisma.paintItem.count({
    where: {
      id: {
        in: uniqueItemIds,
      },
    },
  });

  if (existingItemCount !== uniqueItemIds.length) {
    return NextResponse.json({ message: "Có hạng mục không tồn tại" }, { status: 400 });
  }

  await prisma.$transaction(
    parsed.data.updates.map((update) =>
      prisma.segmentPrice.upsert({
        where: {
          itemId_segment: {
            itemId: update.itemId,
            segment: update.segment,
          },
        },
        update: {
          price: update.price,
        },
        create: {
          itemId: update.itemId,
          segment: update.segment,
          price: update.price,
        },
      }),
    ),
  );

  return NextResponse.json({ message: "Cập nhật giá thành công" });
}
