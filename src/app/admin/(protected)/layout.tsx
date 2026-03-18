import Link from "next/link";

import { LogoutButton } from "@/components/admin/logout-button";
import { requireAdminSession } from "@/lib/auth";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/items", label: "Hạng mục lẻ" },
  { href: "/admin/packages", label: "Gói sơn quay" },
  { href: "/admin/prices", label: "Bảng giá" },
];

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl p-4 md:p-6">
      <header className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Trang quản trị</p>
            <h1 className="text-2xl font-bold text-slate-900">Báo giá sơn xe ô tô</h1>
            <p className="text-sm text-slate-600">Đăng nhập bởi: {session.email}</p>
          </div>
          <LogoutButton />
        </div>

        <nav className="mt-4 flex flex-wrap gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      {children}
    </div>
  );
}
