import { ItemType, PrismaClient, UserRole, VehicleSegment } from "@prisma/client";

import { schemaStatements } from "./schema-sql";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function ensureSchema(): Promise<void> {
  for (const statement of schemaStatements) {
    await prisma.$executeRawUnsafe(statement);
  }
}

const segments: VehicleSegment[] = [
  "HATCHBACK",
  "SEDAN",
  "SUV",
  "MPV",
  "PICKUP",
];

const segmentMultiplier: Record<VehicleSegment, number> = {
  HATCHBACK: 1,
  SEDAN: 1.08,
  SUV: 1.2,
  MPV: 1.15,
  PICKUP: 1.22,
};

type SeedItem = {
  code: string;
  name: string;
  description?: string;
  sortOrder: number;
  basePrice: number;
};

const defaultPartItems: SeedItem[] = [
  { code: "PART_CAN_TRUOC", name: "Cản trước", sortOrder: 1, basePrice: 1200000 },
  { code: "PART_NUA_CAN_TRUOC", name: "Nửa cản trước", sortOrder: 2, basePrice: 700000 },
  { code: "PART_CAN_SAU", name: "Cản sau", sortOrder: 3, basePrice: 1200000 },
  { code: "PART_NUA_CAN_SAU", name: "Nửa cản sau", sortOrder: 4, basePrice: 700000 },
  { code: "PART_CUA_TRUOC_TAI", name: "Cửa trước bên tài", sortOrder: 5, basePrice: 1300000 },
  { code: "PART_CUA_TRUOC_PHU", name: "Cửa trước bên phụ", sortOrder: 6, basePrice: 1300000 },
  { code: "PART_CUA_SAU_TAI", name: "Cửa sau bên tài", sortOrder: 7, basePrice: 1250000 },
  { code: "PART_CUA_SAU_PHU", name: "Cửa sau bên phụ", sortOrder: 8, basePrice: 1250000 },
  { code: "PART_TAI_XE_TRUOC_TAI", name: "Tai xe trước bên tài", sortOrder: 9, basePrice: 1100000 },
  { code: "PART_TAI_XE_TRUOC_PHU", name: "Tai xe trước bên phụ", sortOrder: 10, basePrice: 1100000 },
  { code: "PART_HONG_SAU_TAI", name: "Hông sau bên tài", sortOrder: 11, basePrice: 1450000 },
  { code: "PART_HONG_SAU_PHU", name: "Hông sau bên phụ", sortOrder: 12, basePrice: 1450000 },
  { code: "PART_NAP_CAPO", name: "Nắp capo", sortOrder: 13, basePrice: 1850000 },
  { code: "PART_COP_SAU", name: "Cốp sau", sortOrder: 14, basePrice: 1650000 },
  { code: "PART_NOC_XE", name: "Nóc xe", sortOrder: 15, basePrice: 2100000 },
  { code: "PART_GUONG_TAI", name: "Gương bên tài", sortOrder: 16, basePrice: 450000 },
  { code: "PART_GUONG_PHU", name: "Gương bên phụ", sortOrder: 17, basePrice: 450000 },
  { code: "PART_OP_HONG_TAI", name: "Ốp hông bên tài", sortOrder: 18, basePrice: 600000 },
  { code: "PART_OP_HONG_PHU", name: "Ốp hông bên phụ", sortOrder: 19, basePrice: 600000 },
  {
    code: "PART_BE_BUOC",
    name: "Bệ bước / bậc cửa",
    sortOrder: 20,
    basePrice: 550000,
  },
];

const defaultPackageItems: SeedItem[] = [
  {
    code: "PKG_SON_QUAY_NGUYEN_XE",
    name: "Sơn quay nguyên xe",
    description: "Sơn lại toàn bộ thân vỏ xe, giữ nguyên màu hiện tại.",
    sortOrder: 1,
    basePrice: 15500000,
  },
  {
    code: "PKG_SON_QUAY_TRU_COP",
    name: "Sơn quay trừ cốp",
    description: "Sơn quay toàn xe, không bao gồm cốp sau.",
    sortOrder: 2,
    basePrice: 14500000,
  },
  {
    code: "PKG_SON_QUAY_TRU_CAPO",
    name: "Sơn quay trừ nắp capo",
    description: "Sơn quay toàn xe, không bao gồm nắp capo.",
    sortOrder: 3,
    basePrice: 14200000,
  },
  {
    code: "PKG_SON_QUAY_TRU_NOC",
    name: "Sơn quay trừ nóc",
    description: "Sơn quay toàn xe, không bao gồm nóc xe.",
    sortOrder: 4,
    basePrice: 13800000,
  },
  {
    code: "PKG_SON_TRONG_NGOAI",
    name: "Sơn trong ngoài",
    description: "Sơn cả bề mặt ngoài và các phần trong khoang cửa.",
    sortOrder: 5,
    basePrice: 17800000,
  },
  {
    code: "PKG_SON_DOI_MAU",
    name: "Sơn đổi màu",
    description: "Sơn đổi sang màu mới theo yêu cầu khách hàng.",
    sortOrder: 6,
    basePrice: 22500000,
  },
];

function roundPrice(amount: number): number {
  return Math.round(amount / 50000) * 50000;
}

function buildPrice(basePrice: number, segment: VehicleSegment): number {
  return roundPrice(basePrice * segmentMultiplier[segment]);
}

async function seedItems(type: ItemType, items: SeedItem[]): Promise<void> {
  for (const item of items) {
    const createdOrUpdated = await prisma.paintItem.upsert({
      where: { code: item.code },
      update: {
        name: item.name,
        type,
        description: item.description,
        active: true,
        sortOrder: item.sortOrder,
      },
      create: {
        code: item.code,
        name: item.name,
        type,
        description: item.description,
        active: true,
        sortOrder: item.sortOrder,
      },
    });

    for (const segment of segments) {
      await prisma.segmentPrice.upsert({
        where: {
          itemId_segment: {
            itemId: createdOrUpdated.id,
            segment,
          },
        },
        update: {
          price: buildPrice(item.basePrice, segment),
        },
        create: {
          itemId: createdOrUpdated.id,
          segment,
          price: buildPrice(item.basePrice, segment),
        },
      });
    }
  }
}

async function seedAdminUser(): Promise<void> {
  const adminEmail = "admin@baogia.local";
  const adminPassword = "Admin@123";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: hashPassword(adminPassword),
      role: UserRole.ADMIN,
    },
    create: {
      email: adminEmail,
      passwordHash: hashPassword(adminPassword),
      role: UserRole.ADMIN,
    },
  });
}

async function main(): Promise<void> {
  await ensureSchema();
  await seedItems(ItemType.PART, defaultPartItems);
  await seedItems(ItemType.PACKAGE, defaultPackageItems);
  await seedAdminUser();

  console.log("Seed dữ liệu thành công.");
}

main()
  .catch((error) => {
    console.error("Seed dữ liệu thất bại:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
