import { PriceMatrixManager } from "@/components/admin/price-matrix-manager";
import { getItemsForPriceMatrix } from "@/lib/paint-items";

export default async function AdminPriceMatrixPage() {
  const items = await getItemsForPriceMatrix();

  return (
    <main className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900">Bảng giá theo phân khúc xe</h2>
      <p className="text-sm text-slate-600">
        Sửa giá theo từng dòng và bấm nút Lưu dòng để cập nhật nhanh.
      </p>
      <PriceMatrixManager items={items} />
    </main>
  );
}
