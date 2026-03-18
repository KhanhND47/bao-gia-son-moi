export const VEHICLE_SEGMENTS = [
  "HATCHBACK",
  "SEDAN",
  "SUV",
  "MPV",
  "PICKUP",
] as const;

export type VehicleSegment = (typeof VEHICLE_SEGMENTS)[number];

export const VEHICLE_SEGMENT_LABELS: Record<VehicleSegment, string> = {
  HATCHBACK: "Hatchback",
  SEDAN: "Sedan",
  SUV: "SUV",
  MPV: "MPV",
  PICKUP: "Pickup (Bán tải)",
};

export const ITEM_TYPES = ["PART", "PACKAGE"] as const;

export type ItemType = (typeof ITEM_TYPES)[number];

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  PART: "Hạng mục lẻ",
  PACKAGE: "Gói sơn quay",
};
