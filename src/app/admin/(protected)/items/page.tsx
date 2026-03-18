import { ItemManager } from "@/components/admin/item-manager";
import { getAdminItems } from "@/lib/paint-items";

export const dynamic = "force-dynamic";

export default async function AdminPartItemsPage() {
  const items = await getAdminItems("PART");

  return (
    <main className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900">Quản lý hạng mục lẻ</h2>
      <ItemManager type="PART" items={items} />
    </main>
  );
}