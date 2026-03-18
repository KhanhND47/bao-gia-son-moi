"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { ITEM_TYPE_LABELS } from "@/lib/constants";

type AdminItem = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
  sortOrder: number;
  type: "PART" | "PACKAGE";
};

type Feedback = {
  type: "success" | "error";
  message: string;
};

type ItemManagerProps = {
  type: "PART" | "PACKAGE";
  items: AdminItem[];
};

function parseItemForm(formData: FormData): {
  code: string;
  name: string;
  description: string;
  active: boolean;
  sortOrder: number;
} {
  return {
    code: String(formData.get("code") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    active: formData.get("active") === "on",
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  };
}

export function ItemManager({ type, items }: ItemManagerProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  async function handleCreate(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setBusyKey("create");
    setFeedback(null);

    const formData = new FormData(event.currentTarget);
    const payload = parseItemForm(formData);

    try {
      const response = await fetch("/api/admin/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          type,
        }),
      });

      const body = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        setFeedback({
          type: "error",
          message: body?.message ?? "Không thể tạo mới",
        });
        return;
      }

      setFeedback({
        type: "success",
        message: body?.message ?? "Tạo mới thành công",
      });
      event.currentTarget.reset();
      router.refresh();
    } catch {
      setFeedback({ type: "error", message: "Có lỗi kết nối, vui lòng thử lại" });
    } finally {
      setBusyKey(null);
    }
  }

  async function handleUpdate(
    event: FormEvent<HTMLFormElement>,
    itemId: string,
  ): Promise<void> {
    event.preventDefault();
    setBusyKey(`update-${itemId}`);
    setFeedback(null);

    const formData = new FormData(event.currentTarget);
    const payload = parseItemForm(formData);

    try {
      const response = await fetch(`/api/admin/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const body = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        setFeedback({
          type: "error",
          message: body?.message ?? "Không thể cập nhật hạng mục",
        });
        return;
      }

      setFeedback({
        type: "success",
        message: body?.message ?? "Cập nhật thành công",
      });
      router.refresh();
    } catch {
      setFeedback({ type: "error", message: "Có lỗi kết nối, vui lòng thử lại" });
    } finally {
      setBusyKey(null);
    }
  }

  async function handleDelete(item: AdminItem): Promise<void> {
    const accepted = window.confirm(`Xóa hạng mục "${item.name}"?`);

    if (!accepted) {
      return;
    }

    setBusyKey(`delete-${item.id}`);
    setFeedback(null);

    try {
      const response = await fetch(`/api/admin/items/${item.id}`, {
        method: "DELETE",
      });

      const body = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        setFeedback({
          type: "error",
          message: body?.message ?? "Không thể xóa hạng mục",
        });
        return;
      }

      setFeedback({
        type: "success",
        message: body?.message ?? "Đã xóa hạng mục",
      });
      router.refresh();
    } catch {
      setFeedback({ type: "error", message: "Có lỗi kết nối, vui lòng thử lại" });
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800">
          Thêm mới {ITEM_TYPE_LABELS[type].toLowerCase()}
        </h2>

        <form onSubmit={handleCreate} className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            name="code"
            required
            placeholder="Mã hạng mục (ví dụ: PART_CAN_TRUOC)"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-amber-500 focus:ring"
          />
          <input
            name="name"
            required
            placeholder="Tên hạng mục"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-amber-500 focus:ring"
          />
          <input
            name="description"
            placeholder="Mô tả (không bắt buộc)"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-amber-500 focus:ring md:col-span-2"
          />
          <input
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={0}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-amber-500 focus:ring"
          />
          <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700">
            <input name="active" type="checkbox" defaultChecked className="h-4 w-4 accent-amber-500" />
            Kích hoạt hạng mục
          </label>
          <button
            type="submit"
            disabled={busyKey === "create"}
            className="md:col-span-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
          >
            {busyKey === "create" ? "Đang lưu..." : "Thêm mới"}
          </button>
        </form>
      </section>

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

      <section className="space-y-3">
        {items.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
            Chưa có dữ liệu.
          </div>
        )}

        {items.map((item) => (
          <form
            key={item.id}
            onSubmit={(event) => handleUpdate(event, item.id)}
            className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2"
          >
            <input
              name="code"
              required
              defaultValue={item.code}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-amber-500 focus:ring"
            />
            <input
              name="name"
              required
              defaultValue={item.name}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-amber-500 focus:ring"
            />
            <input
              name="description"
              defaultValue={item.description ?? ""}
              placeholder="Mô tả"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-amber-500 focus:ring md:col-span-2"
            />
            <input
              name="sortOrder"
              type="number"
              min={0}
              defaultValue={item.sortOrder}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-amber-500 focus:ring"
            />
            <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700">
              <input
                name="active"
                type="checkbox"
                defaultChecked={item.active}
                className="h-4 w-4 accent-amber-500"
              />
              Đang active
            </label>

            <div className="flex gap-2 md:col-span-2">
              <button
                type="submit"
                disabled={busyKey === `update-${item.id}`}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
              >
                {busyKey === `update-${item.id}` ? "Đang lưu..." : "Lưu"}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(item)}
                disabled={busyKey === `delete-${item.id}`}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busyKey === `delete-${item.id}` ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </form>
        ))}
      </section>
    </div>
  );
}
