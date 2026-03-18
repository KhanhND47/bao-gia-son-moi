import Link from "next/link";

import { getAdminStats } from "@/lib/paint-items";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <main className="space-y-4">
      <section className="grid gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Hạng mục lẻ</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{stats.partCount}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Gói sơn quay</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{stats.packageCount}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Đang active</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{stats.activeCount}</p>
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800">Lối tắt</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/admin/items"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Quản lý hạng mục lẻ
          </Link>
          <Link
            href="/admin/packages"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Quản lý gói sơn quay
          </Link>
          <Link
            href="/admin/prices"
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
          >
            Chỉnh bảng giá
          </Link>
          <Link
            href="/"
            target="_blank"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Xem trang báo giá
          </Link>
        </div>
      </section>
    </main>
  );
}
