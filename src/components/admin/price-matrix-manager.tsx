"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ITEM_TYPE_LABELS,
  type VehicleSegment,
  VEHICLE_SEGMENT_LABELS,
  VEHICLE_SEGMENTS,
} from "@/lib/constants";
import { formatVnd } from "@/lib/format";

type MatrixItem = {
  id: string;
  code: string;
  name: string;
  active: boolean;
  type: "PART" | "PACKAGE";
  sortOrder: number;
  prices: Record<VehicleSegment, number>;
};

type Feedback = {
  type: "success" | "error";
  message: string;
};

type PriceMatrixManagerProps = {
  items: MatrixItem[];
};

function createInitialState(items: MatrixItem[]): Record<string, Record<VehicleSegment, string>> {
  const state: Record<string, Record<VehicleSegment, string>> = {};

  for (const item of items) {
    state[item.id] = {
      HATCHBACK: String(item.prices.HATCHBACK),
      SEDAN: String(item.prices.SEDAN),
      SUV: String(item.prices.SUV),
      MPV: String(item.prices.MPV),
      PICKUP: String(item.prices.PICKUP),
    };
  }

  return state;
}

export function PriceMatrixManager({ items }: PriceMatrixManagerProps) {
  const router = useRouter();
  const [activeType, setActiveType] = useState<"PART" | "PACKAGE">("PART");
  const [values, setValues] = useState<Record<string, Record<VehicleSegment, string>>>(() =>
    createInitialState(items),
  );
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [savingRow, setSavingRow] = useState<string | null>(null);

  const filteredItems = useMemo(
    () => items.filter((item) => item.type === activeType),
    [activeType, items],
  );

  function updateCell(itemId: string, segment: VehicleSegment, value: string): void {
    setValues((current) => ({
      ...current,
      [itemId]: {
        ...current[itemId],
        [segment]: value,
      },
    }));
  }

  async function saveRow(itemId: string): Promise<void> {
    const rowValues = values[itemId];

    if (!rowValues) {
      return;
    }

    setSavingRow(itemId);
    setFeedback(null);

    const updates = VEHICLE_SEGMENTS.map((segment) => ({
      itemId,
      segment,
      price: Number(rowValues[segment] ?? 0),
    }));

    try {
      const response = await fetch("/api/admin/prices", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updates }),
      });

      const body = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        setFeedback({
          type: "error",
          message: body?.message ?? "Không thể lưu bảng giá",
        });
        return;
      }

      setFeedback({
        type: "success",
        message: body?.message ?? "Lưu bảng giá thành công",
      });
      router.refresh();
    } catch {
      setFeedback({
        type: "error",
        message: "Có lỗi kết nối, vui lòng thử lại",
      });
    } finally {
      setSavingRow(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveType("PART")}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            activeType === "PART"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {ITEM_TYPE_LABELS.PART}
        </button>
        <button
          type="button"
          onClick={() => setActiveType("PACKAGE")}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            activeType === "PACKAGE"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {ITEM_TYPE_LABELS.PACKAGE}
        </button>
      </div>

      {feedback && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {feedback.message}
        </p>
      )}

      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                {item.name} <span className="text-slate-500">({item.code})</span>
              </h3>
              {!item.active && (
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                  Đang tắt
                </span>
              )}
            </div>

            <div className="grid gap-2 md:grid-cols-5">
              {VEHICLE_SEGMENTS.map((segment) => (
                <label key={segment} className="text-xs text-slate-600">
                  <span className="mb-1 block font-medium">{VEHICLE_SEGMENT_LABELS[segment]}</span>
                  <input
                    type="number"
                    min={0}
                    value={values[item.id]?.[segment] ?? "0"}
                    onChange={(event) => updateCell(item.id, segment, event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-amber-500 focus:ring"
                  />
                </label>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Hatchback hiện tại: {formatVnd(Number(values[item.id]?.HATCHBACK ?? 0))}
              </p>
              <button
                type="button"
                onClick={() => saveRow(item.id)}
                disabled={savingRow === item.id}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
              >
                {savingRow === item.id ? "Đang lưu..." : "Lưu dòng"}
              </button>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
            Chưa có dữ liệu cho nhóm này.
          </div>
        )}
      </div>
    </div>
  );
}
