import { z } from "zod";

import { ITEM_TYPES, VEHICLE_SEGMENTS } from "@/lib/constants";

const codeSchema = z
  .string()
  .trim()
  .min(1, "Mã hạng mục là bắt buộc")
  .max(40, "Mã hạng mục tối đa 40 ký tự")
  .regex(/^[A-Za-z0-9_\-/]+$/, "Mã chỉ gồm chữ, số, gạch dưới, gạch ngang, dấu /")
  .transform((value) => value.toUpperCase());

const nameSchema = z
  .string()
  .trim()
  .min(1, "Tên hạng mục không được để trống")
  .max(120, "Tên hạng mục tối đa 120 ký tự");

const descriptionSchema = z
  .string()
  .trim()
  .max(300, "Mô tả tối đa 300 ký tự")
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : undefined));

const sortOrderSchema = z.coerce
  .number()
  .int("Thứ tự hiển thị phải là số nguyên")
  .min(0, "Thứ tự hiển thị không được âm");

const activeSchema = z.coerce.boolean();

export const itemTypeSchema = z.enum(ITEM_TYPES);
export const vehicleSegmentSchema = z.enum(VEHICLE_SEGMENTS);

export const createItemSchema = z.object({
  code: codeSchema,
  name: nameSchema,
  description: descriptionSchema,
  type: itemTypeSchema,
  active: activeSchema.default(true),
  sortOrder: sortOrderSchema.default(0),
});

export const updateItemSchema = z.object({
  code: codeSchema,
  name: nameSchema,
  description: descriptionSchema,
  active: activeSchema.default(true),
  sortOrder: sortOrderSchema.default(0),
});

export const updatePriceSchema = z.object({
  itemId: z.string().min(1),
  segment: vehicleSegmentSchema,
  price: z.coerce
    .number()
    .int("Giá phải là số nguyên")
    .min(0, "Giá không được âm"),
});

export const bulkUpdatePriceSchema = z.object({
  updates: z.array(updatePriceSchema).min(1, "Cần ít nhất một thay đổi giá"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

export function getZodErrorMessage(error: z.ZodError): string {
  const issue = error.issues[0];
  return issue?.message ?? "Dữ liệu không hợp lệ";
}
