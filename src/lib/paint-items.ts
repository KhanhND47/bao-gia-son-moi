import { type ItemType, type Prisma, type VehicleSegment } from "@prisma/client";

import { VEHICLE_SEGMENTS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

type PaintItemWithPrices = Prisma.PaintItemGetPayload<{
  include: {
    prices: true;
  };
}>;

export type ItemViewModel = {
  id: string;
  code: string;
  name: string;
  type: ItemType;
  description: string | null;
  active: boolean;
  sortOrder: number;
  prices: Record<VehicleSegment, number>;
};

function toPriceMap(item: PaintItemWithPrices): Record<VehicleSegment, number> {
  const map = {
    HATCHBACK: 0,
    SEDAN: 0,
    SUV: 0,
    MPV: 0,
    PICKUP: 0,
  } as Record<VehicleSegment, number>;

  for (const price of item.prices) {
    map[price.segment] = price.price;
  }

  return map;
}

function toItemViewModel(item: PaintItemWithPrices): ItemViewModel {
  return {
    id: item.id,
    code: item.code,
    name: item.name,
    type: item.type,
    description: item.description,
    active: item.active,
    sortOrder: item.sortOrder,
    prices: toPriceMap(item),
  };
}

export async function getQuoteItems(): Promise<ItemViewModel[]> {
  const items = await prisma.paintItem.findMany({
    where: {
      active: true,
    },
    include: {
      prices: true,
    },
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });

  return items.map(toItemViewModel);
}

export async function getAdminItems(type: ItemType): Promise<ItemViewModel[]> {
  const items = await prisma.paintItem.findMany({
    where: {
      type,
    },
    include: {
      prices: true,
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return items.map(toItemViewModel);
}

export async function getItemsForPriceMatrix(): Promise<ItemViewModel[]> {
  const items = await prisma.paintItem.findMany({
    include: {
      prices: true,
    },
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });

  return items.map(toItemViewModel);
}

export async function getAdminStats(): Promise<{
  partCount: number;
  packageCount: number;
  activeCount: number;
}> {
  const [partCount, packageCount, activeCount] = await Promise.all([
    prisma.paintItem.count({ where: { type: "PART" } }),
    prisma.paintItem.count({ where: { type: "PACKAGE" } }),
    prisma.paintItem.count({ where: { active: true } }),
  ]);

  return {
    partCount,
    packageCount,
    activeCount,
  };
}

export function listSegments(): readonly VehicleSegment[] {
  return VEHICLE_SEGMENTS;
}
