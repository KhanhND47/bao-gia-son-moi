import { ItemManager } from "@/components/admin/item-manager";
import { getAdminItems } from "@/lib/paint-items";

export const dynamic = "force-dynamic";

export default async function AdminPackagesPage() {
  const items = await getAdminItems("PACKAGE");

  return (
    <main className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900">Quản lý gói sơn quay</h2>
      <ItemManager type="PACKAGE" items={items} />
    </main>
  );
}